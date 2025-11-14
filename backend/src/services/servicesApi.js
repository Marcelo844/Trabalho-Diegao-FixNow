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

// Dashboard do prestador (já existia)
export async function fetchProviderDashboard() {
  const response = await api.get("/services/dashboard/provider");
  return response.data;
}

// Serviços do prestador logado (já existia)
export async function fetchMyServices() {
  const data = await fetchProviderDashboard();
  return data.myServices || [];
}

// Excluir serviço (já existia)
export async function deleteServiceById(serviceId) {
  await api.delete(`/services/${serviceId}`);
}

// Atualizar disponibilidade (já existia)
export async function updateServiceAvailability(serviceId, available) {
  const response = await api.patch(`/services/${serviceId}/availability`, {
    available,
  });
  return response.data;
}