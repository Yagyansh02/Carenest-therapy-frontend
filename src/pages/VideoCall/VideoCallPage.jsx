import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoService } from '../../api/video';
import { createPeer, getLocalStream } from '../../services/videoService';

const PHASE = {
  LOADING: 'loading',
  READY: 'ready',      // streams + peer ready; therapist can start call
  WAITING: 'waiting',  // patient waiting for therapist to call
  CALLING: 'calling',  // therapist dialling out
  IN_CALL: 'in-call',
  ENDED: 'ended',
  ERROR: 'error',
};

export const VideoCallPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.LOADING);
  const [callInfo, setCallInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const activeCallRef = useRef(null);
  const timerRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const attachStream = (videoEl, stream) => {
    if (videoEl && stream && videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(
      () => setElapsedSeconds((s) => s + 1),
      1000
    );
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
    setRemoteConnected(true);
    setPhase(PHASE.IN_CALL);
    startTimer();
  }, []);

  const wireCall = useCallback(
    (call) => {
      activeCallRef.current = call;

      call.on('stream', handleRemoteStream);

      call.on('close', () => {
        setRemoteConnected(false);
        setPhase(PHASE.ENDED);
        clearInterval(timerRef.current);
      });

      call.on('error', (err) => {
        console.error('[VideoCall] call error', err);
        setErrorMsg('Call error: ' + err.message);
        setPhase(PHASE.ERROR);
      });
    },
    [handleRemoteStream]
  );

  // ── Cleanup ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    activeCallRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    activeCallRef.current = null;
    localStreamRef.current = null;
    peerRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ── Initialisation ────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1. Fetch peer IDs + session info from backend
        const { data } = await videoService.getVideoCallToken(sessionId);
        const info = data.data;
        if (cancelled) return;
        setCallInfo(info);

        // 2. Get user media
        let stream;
        try {
          stream = await getLocalStream();
        } catch {
          throw new Error(
            'Camera / microphone access denied. Please allow permissions and try again.'
          );
        }
        if (cancelled) return;

        localStreamRef.current = stream;
        attachStream(localVideoRef.current, stream);

        // 3. Create Peer registered with our deterministic ID
        const peer = createPeer(info.myPeerId);
        peerRef.current = peer;

        peer.on('error', (err) => {
          // "unavailable-id" means the same tab is already open; use a
          // suffix-based fallback so the user can still connect.
          if (err.type === 'unavailable-id') {
            const fallback = `${info.myPeerId}-${Date.now()}`;
            console.warn('[VideoCall] peer ID taken, retrying with', fallback);
            if (!cancelled) {
              peerRef.current?.destroy();
              const p2 = createPeer(fallback);
              peerRef.current = p2;
              setupPeer(p2, info, stream);
            }
          } else {
            console.error('[VideoCall] peer error', err);
            if (!cancelled) {
              setErrorMsg('Connection error: ' + err.message);
              setPhase(PHASE.ERROR);
            }
          }
        });

        setupPeer(peer, info, stream);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.response?.data?.message || err.message || 'Failed to set up video call');
          setPhase(PHASE.ERROR);
        }
      }
    };

    const setupPeer = (peer, info, stream) => {
      peer.on('open', () => {
        if (cancelled) return;
        // Patient waits; therapist is ready to start
        setPhase(info.role === 'therapist' ? PHASE.READY : PHASE.WAITING);
      });

      // Handle incoming calls (patient receives from therapist)
      peer.on('call', (incomingCall) => {
        if (cancelled) return;
        incomingCall.answer(stream);
        wireCall(incomingCall);
      });
    };

    init();
    return () => { cancelled = true; };
  }, [sessionId, wireCall]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startCall = () => {
    if (!peerRef.current || !localStreamRef.current || !callInfo) return;
    setPhase(PHASE.CALLING);
    const call = peerRef.current.call(callInfo.otherPeerId, localStreamRef.current);
    if (!call) {
      setErrorMsg('Could not reach the other participant. Make sure they have joined the call page.');
      setPhase(PHASE.READY);
      return;
    }
    wireCall(call);
  };

  const endCall = () => {
    cleanup();
    setPhase(PHASE.ENDED);
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((v) => !v);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const OtherName =
    callInfo?.role === 'therapist'
      ? callInfo?.sessionInfo?.patientName
      : callInfo?.sessionInfo?.therapistName;

  const MyName =
    callInfo?.role === 'therapist'
      ? callInfo?.sessionInfo?.therapistName
      : callInfo?.sessionInfo?.patientName;

  // ── UI ────────────────────────────────────────────────────────────────────

  if (phase === PHASE.LOADING) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
          <p className="text-lg">Setting up your secure video call…</p>
        </div>
      </div>
    );
  }

  if (phase === PHASE.ERROR) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Unable to join call</h2>
          <p className="text-gray-400 mb-6 text-sm">{errorMsg}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (phase === PHASE.ENDED) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Session ended</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Duration: <span className="text-white font-medium">{formatTime(elapsedSeconds)}</span>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-gray-900/90 to-transparent">
        <div>
          <p className="text-white font-semibold text-lg">
            {phase === PHASE.IN_CALL ? OtherName : 'CareNest Video Session'}
          </p>
          {phase === PHASE.IN_CALL && (
            <p className="text-green-400 text-sm font-mono">{formatTime(elapsedSeconds)}</p>
          )}
          {phase === PHASE.CALLING && (
            <p className="text-yellow-300 text-sm animate-pulse">Calling {OtherName}…</p>
          )}
          {phase === PHASE.WAITING && (
            <p className="text-blue-300 text-sm animate-pulse">Waiting for {OtherName} to start the call…</p>
          )}
          {phase === PHASE.READY && (
            <p className="text-gray-300 text-sm">Ready — click Start Call when both of you are here</p>
          )}
        </div>

        {/* Session date/time chip */}
        {callInfo?.sessionInfo && (
          <div className="hidden md:block text-right">
            <p className="text-gray-400 text-xs">
              {new Date(callInfo.sessionInfo.scheduledAt).toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p className="text-gray-500 text-xs">{callInfo.sessionInfo.duration} min session</p>
          </div>
        )}
      </div>

      {/* Remote video — full canvas */}
      <div className="flex-1 relative bg-gray-800">
        {phase === PHASE.IN_CALL ? (
          <video
            ref={(el) => {
              remoteVideoRef.current = el;
              attachStream(el, remoteStream);
            }}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder when remote isn't connected */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-gray-400">
                {OtherName?.charAt(0) || '?'}
              </span>
            </div>
            <p className="text-gray-400 text-lg">{OtherName || 'Participant'}</p>
          </div>
        )}

        {/* Local video — picture-in-picture */}
        <div className="absolute bottom-28 right-4 w-36 h-28 md:w-48 md:h-36 rounded-xl overflow-hidden border-2 border-gray-600 shadow-xl bg-gray-700 z-10">
          <video
            ref={(el) => {
              localVideoRef.current = el;
              attachStream(el, localStreamRef.current);
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
          )}
          <p className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow">You</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-4 px-6 py-5 bg-gradient-to-t from-gray-900/95 to-transparent">

        {/* Mute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <line x1="17" y1="7" x2="7" y2="17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M12 6a6 6 0 010 12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            {isCameraOff && (
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Start Call — therapist only, shown in READY/CALLING phases */}
        {callInfo?.role === 'therapist' && (phase === PHASE.READY || phase === PHASE.CALLING) && (
          <button
            onClick={startCall}
            disabled={phase === PHASE.CALLING}
            className="px-6 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 transition disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79A15.053 15.053 0 0013.21 17.38l2.45-2.45a1 1 0 011.02-.24c1.12.45 2.33.69 3.57.69a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6.25A1 1 0 014 5.25h3.5a1 1 0 011 1c0 1.25.24 2.45.69 3.57a1 1 0 01-.24 1.01l-.33.96z" />
            </svg>
            {phase === PHASE.CALLING ? 'Calling…' : 'Start Call'}
          </button>
        )}

        {/* End Call */}
        <button
          onClick={endCall}
          title="End call"
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.45 2.33.69 3.58.69A1 1 0 0121 16.7V20a1 1 0 01-1 1C9.39 21 3 14.61 3 6.5A1 1 0 014 5.5h3.5a1 1 0 011 1c0 1.25.24 2.46.69 3.58a1 1 0 01-.57 1.21z"
              transform="rotate(135 12 12)" />
          </svg>
        </button>

        {/* My name label */}
        <span className="hidden md:block text-gray-400 text-sm absolute right-6">{MyName}</span>
      </div>
    </div>
  );
};
