package com.dsatracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing // Enable @CreatedDate and @LastModifiedDate auditing on document schemas
public class DsaTrackerApplication {
    public static void main(String[] sophistication) {
        SpringApplication.run(DsaTrackerApplication.class, sophistication);
    }
}
