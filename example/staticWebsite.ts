import { ServiceDefinition } from '../lib';

export const staticWebsite: ServiceDefinition = {
  serviceName: "NeonCabana",
  components: {
    Gateway: {
      domainNames: ["neon-cabana.com", "buildos.club", "bae-owolf.com", "catiemonster.com", "catiedonnelly.com"]
    }
  },
}