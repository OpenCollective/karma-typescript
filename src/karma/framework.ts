import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Bundler } from "../bundler/bundler";
import { Resolver } from "../bundler/resolve/resolver";
import { Coverage } from "../istanbul/coverage";
import { Configuration } from "../shared/configuration";

export class Framework {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any): void };
    private log: Logger;

    constructor(bundler: Bundler, config: Configuration, coverage: Coverage, resolver: Resolver) {

        this.create = (karmaConfig: ConfigOptions, helper: any, logger: any) => {
            this.log = logger.create("framework.karma-typescript");

            config.initialize(karmaConfig);
            coverage.initialize(helper, logger);
            resolver.initialize();

            if (!config.hasFramework("commonjs")) {
                bundler.attach((<any> karmaConfig.files));
            }

            config.bundlerOptions.transforms.forEach((t) => {
                if (t.initialize) {
                    t.initialize({
                        appenders: karmaConfig.loggers,
                        level: karmaConfig.logLevel
                    });
                }
            });

            this.log.debug("Configuration:\n", JSON.stringify(config, this.replacer, 3));
        };

        (<any> this.create).$inject = ["config", "helper", "logger"];
    }

    private replacer(key: string, value: string) {
        if (key && typeof value === "function") {
            return (value + "").substr(0, 100) + "...";
        }
        return value;
    }
}
