package com.helpdesk.backend;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner bootstrapDemoSupport(UserRepository userRepository) {
        return args -> {
            userRepository.findByEmail("support.demo@helpdesk.com")
                    .ifPresent(user -> {
                        if (user.getRole() != Role.IT_SUPPORT) {
                            user.setRole(Role.IT_SUPPORT);
                            userRepository.save(user);
                            System.out.println(
                                "Demo IT Support role bootstrapped successfully."
                            );
                        }
                    });
        };
    }
}
