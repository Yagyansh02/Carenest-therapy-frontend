import api from "./axios";

export const therapistService = {
  getAllTherapists: (page = 1, limit = 10) =>
    api.get(`/therapists?page=${page}&limit=${limit}`),
  getTherapistById: (id) => api.get(`/therapists/${id}`),
  getTherapistAvailability: (id) => api.get(`/therapists/${id}/availability`),
  createTherapistProfile: (profileData) =>
    api.post("/therapists/profile", profileData),
  getMyProfile: () => api.get("/therapists/me"),
  updateTherapistProfile: (profileData) =>
    api.put("/therapists/profile", profileData),
  updateAvailability: (availability) =>
    api.put("/therapists/availability", { availability }),
  updateQualifications: (qualifications) =>
    api.put("/therapists/qualifications", { qualifications }),
  updateSpecializations: (specializations) =>
    api.put("/therapists/specializations", { specializations }),
  verifyTherapist: (therapistId) =>
    api.put(`/therapists/verify/${therapistId}`, { status: "verified" }),
};
