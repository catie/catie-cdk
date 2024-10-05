import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ServiceComponent, ServiceComponentProps } from './component';


// TODO: Make this configurable
const DEFAULT_PORT = 6969


export class Service extends ServiceComponent {
  readonly cluster: Cluster;
  readonly securityGroup: SecurityGroup;

  constructor(props: ServiceComponentProps) {
    super(props);

    this.cluster = new Cluster(this, this.componentName);
    this.securityGroup = new SecurityGroup(this, "SecurityGroup", {
      vpc: this.cluster.vpc,
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(DEFAULT_PORT));
  }

  private getPropsFor(componentName: string): ServiceComponentProps {
    return {
      scope: this,
      context: this.context,
      name: componentName,
    }
  }
}
