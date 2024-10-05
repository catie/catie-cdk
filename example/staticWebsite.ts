import { ServiceDefinition } from '@catie/catie-cdk';

export const staticWebsite: ServiceDefinition = {
  serviceName: "NeonCabana",
  components: {
    gateway: {
      domainNames: ["neon-cabana.com", "buildos.club", "bae-owolf.com", "catiemonster.com", "catiedonnelly.com"]
    }
  },
}