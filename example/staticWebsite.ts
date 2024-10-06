import { ServiceDefinition } from '../lib';

export const staticWebsite: ServiceDefinition = {
  serviceName: "NeonCabana",
  gateway: {
    domainNames: ["neon-cabana.com"],
  },
  components: {
    baeowolf: {
      isWebsite: true,
      domainNames: ["bae-owolf.com"],
    }
  },
}