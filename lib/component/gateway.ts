import { ServiceContext } from '../core/context';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ServiceBucket } from './bucket';
import { GatewayDefinition, SupportedDefinition } from '../core/definition';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { EncryptedComponent, EncryptedComponentProps, ServiceComponentProps } from '../core/component';


export class ServiceGateway extends EncryptedComponent {
    readonly assetContainer: ServiceBucket;
    readonly hostedZones: { [key: string]: HostedZone };
    readonly distribution: Distribution;

    constructor(props: EncryptedComponentProps, definition: GatewayDefinition) {
        super(props);

        this.assetContainer = new ServiceBucket(this.childProps("Assets"), { bucketName: `${this.context.serviceName}-assets` });

        this.hostedZones = this.buildHostedZones(definition.domainNames);
        const certificate = this.buildCertificate(this.hostedZones);
        this.distribution = new Distribution(this, this.childName("CloudFront"), {
            defaultBehavior: definition.defaultBehavior ?? {
                origin: new S3StaticWebsiteOrigin(this.assetContainer.bucket),
            },
            domainNames: definition.domainNames,
            certificate: certificate,
            logBucket: this.assetContainer.logBucket,
        });
    }

    private buildCertificate(hostedZones: { [key: string]: HostedZone }): Certificate {
        const domains = Object.keys(hostedZones);
        const primary = domains[0];
        const alts = domains.slice(1, domains.length);
        return new Certificate(this, this.childName("Certificate"), {
            domainName: primary,
            subjectAlternativeNames: alts,
        })
    }

    private buildHostedZones(domainNames: string[]): { [key: string]: HostedZone } {
        const zones = domainNames.map(domain => [domain, new HostedZone(this, domain, { zoneName: domain })]);
        return Object.fromEntries(zones);
    }

    // private buildZoneName(domainName: string): string {
    //     const transformDomain = domainName.toLocaleLowerCase();
    //     transformDomain.replace(".", "_");
    //     return `${transformDomain}`;
    // }

    public static forDefinition(props: ServiceComponentProps, definition: SupportedDefinition): ServiceGateway {
        return new ServiceGateway(props, definition as GatewayDefinition);
    }
}
