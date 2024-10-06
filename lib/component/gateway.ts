import { AllowedMethods, Distribution, SecurityPolicyProtocol, SSLMethod, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { StaticWebsiteBucket } from './bucket';
import { GatewayDefinition } from '../core/definition';
import { HostedZone, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { EncryptedComponent, EncryptedComponentProps } from '../core/component';

interface SslZone {
    readonly hostedZone: HostedZone;
    readonly certificate: Certificate;
}
export class ServiceGateway extends EncryptedComponent {
    readonly assetContainer: StaticWebsiteBucket;
    readonly hostedZones: { [key: string]: SslZone };
    readonly distribution: Distribution;
    readonly primaryDomain: string;
    readonly altDomains: string[];

    constructor(props: EncryptedComponentProps, definition: GatewayDefinition) {
        super(props);

        this.assetContainer = new StaticWebsiteBucket(this.childProps("Assets"), {
            isWebsite: true,
            bucketName: `${this.context.serviceName}-assets`
        });
        this.primaryDomain = definition.domainNames[0];
        this.altDomains = definition.domainNames.slice(1, definition.domainNames.length);

        this.hostedZones = this.buildHostedZones(definition.domainNames);

        const primaryZone = this.hostedZones[this.primaryDomain];
        this.distribution = new Distribution(this, this.childName("CloudFront"), {
            defaultBehavior: {
                origin: this.assetContainer.origin(),
                allowedMethods: AllowedMethods.ALLOW_ALL,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            domainNames: Object.keys(this.hostedZones),
            certificate: primaryZone.certificate,
        });
    }

    private buildHostedZones(domainNames: string[]): { [key: string]: SslZone } {
        const zones = domainNames.map(domain => [domain, this.buildHostedZone(domain)]);
        return Object.fromEntries(zones);
    }

    private buildHostedZone(domain: string): SslZone {
        const zone = new PublicHostedZone(this, domain, { zoneName: domain, caaAmazon: true });
        const cert = new Certificate(this, `${domain.toLowerCase()}_cert`, {
            domainName: domain,
            validation: CertificateValidation.fromDns(zone),
        })

        return {
            hostedZone: zone,
            certificate: cert,
        };
    }

    public addStaticWebsite(website: StaticWebsiteBucket, domains?: string[]) {
        const zones = this.buildHostedZones(domains ?? []);
        domains?.forEach(domain => this.hostedZones[domain] = zones[domain]);

        this.distribution.addBehavior(Object.keys(zones)[0], website.origin(), {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        });
    }
}
