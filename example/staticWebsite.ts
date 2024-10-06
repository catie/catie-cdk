import { ServiceDefinition } from '../lib';

export const staticWebsite: ServiceDefinition = {
  serviceName: "NeonCabana",
  gateway: {
    domainNames: ["neon-cabana.com"],
    // keySigningKeyName: "DnsSec",
  },
  components: {
    baeowolf: {
      bucketName: "bae-owolf",
      domainNames: ["bae-owolf.com"],
    }
  },
}