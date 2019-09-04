import { handleAckTimeout } from "./commandHandlers";

export async function setAckTimeout(
  serviceId: string,
  delayInMinutes: number,
): Promise<void> {
  await setTimeout(
    (): Promise<void> => handleAckTimeout(serviceId),
    5000, // for demo purpose 5 seconds instead of: delayInMinutes * 60 * 1000,
  );
}
