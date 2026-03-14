package com.hirelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HireLinkApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(HireLinkApplication.class, args);
    }
}
