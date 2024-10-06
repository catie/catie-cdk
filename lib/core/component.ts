import { Construct } from "constructs";
import { ServiceContext } from './context';
import { Key } from "aws-cdk-lib/aws-kms";
import { SupportedDefinition } from "./definition";

export interface ServiceComponentProps {
    readonly scope: Construct;
    readonly context: ServiceContext;
    readonly name: string;
}
export interface EncryptedComponentProps extends ServiceComponentProps {
    readonly key?: Key;
}


export class ServiceComponent extends Construct {
    readonly componentName: string;
    readonly context: ServiceContext;

    public constructor(props: ServiceComponentProps) {
        super(props.scope, props.name);

        this.componentName = props.name;
        this.context = props.context;
    }

    protected childName(nameSuffix: string): string {
        return `${this.componentName}${nameSuffix}`;
    }

    protected childProps(nameSuffix: string): ServiceComponentProps {
        return {
            scope: this,
            context: this.context,
            name: this.childName(nameSuffix),
        }
    }

    public static forDefinition(props: ServiceComponentProps, definition: SupportedDefinition): ServiceComponent {
        throw new Error("No instantiation method defined");
    }
}

export class EncryptedComponent extends ServiceComponent {
    readonly key: Key;

    public constructor(props: EncryptedComponentProps) {
        super(props);
        this.key = props.key ?? new Key(this, this.childName("Key"));
    }
}