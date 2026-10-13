package com.smartqueue.smartqueue.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.smartqueue.smartqueue.entity.Role;
import com.smartqueue.smartqueue.entity.User;
import com.smartqueue.smartqueue.repository.UserRepository;

@Configuration
public class StaffAccountInitializer {

    @Bean
    public CommandLineRunner createInitialStaff(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${smartqueue.staff.name:SmartQueue Staff}") String staffName,
            @Value("${smartqueue.staff.email}") String staffEmail,
            @Value("${smartqueue.staff.password}") String staffPassword) {

        return args -> {
            if (userRepository.existsByEmail(staffEmail)) {
                System.out.println("Initial staff account already exists.");
                return;
            }

            User staff = new User();
            staff.setName(staffName);
            staff.setEmail(staffEmail);
            staff.setPassword(passwordEncoder.encode(staffPassword));
            staff.setRole(Role.STAFF);

            userRepository.save(staff);
            System.out.println("Initial staff account created.");
        };
    }
}