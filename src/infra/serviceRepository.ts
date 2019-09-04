import { Service } from "../domain/Service";
import { persist, findById } from "./jsonRepository";

const policiesPath = "/tmp/services.json";

export const findServiceById = (id: string): Promise<Service> =>
  findById(policiesPath, id);

export const persistService = (
  policyId: string,
  service: Service,
): Promise<void> => persist(policiesPath, policyId, service);
