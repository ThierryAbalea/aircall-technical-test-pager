import {
  onServiceCrashed,
  Service,
  onAckTimeout,
  onTargetAck,
  onServiceUp,
} from "../domain/Service";
import { findServiceById, persistService } from "./serviceRepository";

export async function handleCommand(
  modelHandler: (service: Service) => Promise<Service>,
  serviceId: string,
): Promise<void> {
  console.log(modelHandler);
  const service = await findServiceById(serviceId);
  const newService = await modelHandler(service);
  await persistService(serviceId, newService);
}

export const handleCrashedService = (serviceId: string): Promise<void> =>
  handleCommand(onServiceCrashed, serviceId);

export const handleAckTimeout = (serviceId: string): Promise<void> =>
  handleCommand(onAckTimeout, serviceId);

export const handleTargetAck = (serviceId: string): Promise<void> =>
  handleCommand(onTargetAck, serviceId);

export const handleServiceUp = (serviceId: string): Promise<void> =>
  handleCommand(onServiceUp, serviceId);
