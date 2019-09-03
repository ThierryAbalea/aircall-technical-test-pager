import { triggerAlert, handleAckTimeout, handleTargetAck } from "./Alert";

export type Service = UpService | CrashedService;

interface BaseService {
  id: string;
  escalationPolicyId: string;
  status: string;
}

export type UpService = BaseService & {
  status: "UP";
};

export type CrashedService = BaseService & {
  status: "CRASHED";
  alert: import("./Alert").Alert;
};

export async function onServiceCrashed(service: Service): Promise<Service> {
  // in case the operator crash again the service during the alert handling, we don't want to trigger a new alert
  if (service.status === "CRASHED") {
    return service;
  }
  return triggerAlert(service);
}

export async function onAckTimeout(service: Service): Promise<Service> {
  return handleAckTimeout(service);
}

export async function onTargetAck(service: Service): Promise<Service> {
  return handleTargetAck(service);
}

export async function onServiceUp({
  id,
  escalationPolicyId,
}: Service): Promise<Service> {
  return {
    id,
    escalationPolicyId,
    status: "UP",
  };
  // possible improvement: notify all the previously notified targets that the service is again up
}
