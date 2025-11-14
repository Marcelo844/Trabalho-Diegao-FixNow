// frontend/src/services/servicesApi.js
import api from "./api";

// Lista todos os serviços disponíveis (para o catálogo do cliente)
export async function fetchAllServices() {
  const response = await api.get("/services");
  return response.data.services || [];
}

// Busca detalhes de um serviço específico
export async function fetchServiceById(serviceId) {
  const response = await api.get(`/services/${serviceId}`);
  return response.data.service;
}

// Cria um job (solicitação) para um serviço
export async function createJobForService(serviceId, notes) {
  const response = await api.post(`/services/${serviceId}/jobs`, {
    notes: notes || "",
  });
  return response.data;
}

// Dashboard do CLIENTE
export async function fetchClientDashboard() {
  const response = await api.get("/services/dashboard/client");
  console.log("CLIENT dashboard data =>", response.data);
  return response.data; // { ok, jobs }
}

// Dashboard do PRESTADOR
export async function fetchProviderDashboard() {
  const response = await api.get("/services/dashboard/provider");
  console.log("PROVIDER dashboard data =>", response.data);
  return response.data; // { ok, jobs, myServices }
}

// Lista “meus serviços” do prestador
export async function fetchMyServices() {
  const response = await api.get("/services/my");
  console.log("MY SERVICES data =>", response.data);
  const data = response.data || {};
  return data.myServices || [];
}

// Aceitar atendimento (prestador assume o job)
export async function acceptJob(jobId) {
  const response = await api.post(`/services/jobs/${jobId}/accept`);
  return response.data.job;
}

// Concluir atendimento (marcar como DONE)
export async function completeJob(jobId) {
  try {
    const response = await api.post(`/services/jobs/${jobId}/complete`);
    return response.data.job;
  } catch (e) {
    console.error("Erro na API ao concluir:", e.response?.data || e.message);
    throw e;
  }
}

// Excluir serviço
export async function deleteServiceById(serviceId) {
  await api.delete(`/services/${serviceId}`);
}

// Atualizar disponibilidade
export async function updateServiceAvailability(serviceId, available) {
  const response = await api.patch(`/services/${serviceId}/availability`, {
    available,
  });
  return response.data;
}