package com.dsatracker.security;

import com.dsatracker.model.User;
import com.dsatracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return createPrincipal(user);
    }

    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return createPrincipal(user);
    }

    private UserDetails createPrincipal(User user) {
        // We use role starting with ROLE_ for Spring Security conventions if needed, or raw role.
        String roleWithPrefix = user.getRole().toUpperCase();
        if (!roleWithPrefix.startsWith("ROLE_")) {
            roleWithPrefix = "ROLE_" + roleWithPrefix;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getId(), // We map the ID as username for jwt security context matching
                user.getPassword() != null ? user.getPassword() : "",
                Collections.singletonList(new SimpleGrantedAuthority(roleWithPrefix))
        );
    }
}
