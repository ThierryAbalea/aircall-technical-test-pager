import { Service } from "../../domain/Service";
import { persistService, findServiceById } from "../serviceRepository";

describe("Service Repository", () => {
  it("persist and read a service", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "UP",
    };

    // when
    await persistService("call-router", service);
    const readPolicy = await findServiceById("call-router");

    // then
    expect(readPolicy).toEqual(service);
  });
});
