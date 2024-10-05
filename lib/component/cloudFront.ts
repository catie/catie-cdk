import { ServiceContext } from '../context';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ServiceBucket } from './bucket';
import { EncryptedComponent, EncryptedComponentProps } from './encrypted';
import { CloudFrontDefinition } from '../definition';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';


export class ServiceGateway extends EncryptedComponent {
    readonly context: ServiceContext;
    readonly assetContainer: ServiceBucket;
    readonly hostedZones: { [key: string]: HostedZone };
    readonly distribution: Distribution;

    constructor(props: EncryptedComponentProps, definition: CloudFrontDefinition) {
        super(props);

        this.assetContainer = new ServiceBucket(props, { bucketName: `${this.context.serviceName}-assets` });

        this.hostedZones = this.buildHostedZones(definition.domainNames);
        const certificate = this.buildCertificate(this.hostedZones);
        this.distribution = new Distribution(this, `${this.context.serviceName}Gateway`, {
            defaultBehavior: definition.defaultBehavior ?? {
                origin: new S3StaticWebsiteOrigin(this.assetContainer.bucket),
            },
            domainNames: definition.domainNames,
            certificate: certificate,
            logBucket: this.assetContainer.logBucket,
            logFilePrefix: 'cloudfront',
        });
    }

    private buildCertificate(hostedZones: { [key: string]: HostedZone }): Certificate {
        const domains = Object.keys(hostedZones);
        const primary = domains[0];
        const alts = domains.slice(1, domains.length);
        return new Certificate(this, `${this.context.serviceName}Gateway`, {
            domainName: primary,
            subjectAlternativeNames: alts,
        })
    }

    private buildHostedZones(domainNames: string[]): { [key: string]: HostedZone } {
        const zones = domainNames.map(domain => [domain, new HostedZone(this, this.buildZoneName(domain), { zoneName: domain })]);
        return Object.fromEntries(zones);
    }

    private buildZoneName(domainName: string): string {
        const transformDomain = domainName.toLocaleLowerCase();
        transformDomain.replace(".", "_");
        return `${transformDomain}`;
    }
}
