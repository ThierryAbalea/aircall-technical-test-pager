import { findById, persist } from "./jsonRepository";
import { EscalationPolicy } from "../domain/EscalationPolicy";

const policiesPath = "/tmp/escalation-policies.json";

export const findEscalationPolicyById = async (
  id: string,
): Promise<EscalationPolicy> => findById(policiesPath, id);

export const persistEscalationPolicy = (
  policyId: string,
  policy: EscalationPolicy,
): Promise<void> => persist(policiesPath, policyId, policy);
