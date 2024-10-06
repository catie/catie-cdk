import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ServiceComponent, ServiceComponentProps } from '../core/component';
import { SupportedDefinition } from '../core/definition';


export class ServiceCluster extends ServiceComponent {
  readonly cluster: Cluster;
  readonly securityGroup: SecurityGroup;

  constructor(props: ServiceComponentProps) {
    super(props);

    this.cluster = new Cluster(this, this.componentName);
    this.securityGroup = new SecurityGroup(this, "SecurityGroup", {
      vpc: this.cluster.vpc,
      allowAllOutbound: true,
    });

    // this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(DEFAULT_PORT));
  }

  public static forDefinition(props: ServiceComponentProps, definition: SupportedDefinition): ServiceCluster {
    return new ServiceCluster(props);
  }
}
