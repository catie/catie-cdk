import { ServiceDefinition } from '../lib';

export const staticWebsite: ServiceDefinition = {
  serviceName: "NeonCabana",
  gateway: {
    domainNames: ["neon-cabana.com"],
    keySigningKeyName: "DnsSec",
  },
  components: {},
}