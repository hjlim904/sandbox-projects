package com.practice.auth.repository;

import com.practice.auth.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("회원 정보를 DB에 저장 및 조회")
    void saveAndFindUser(){
        User user = User.builder().username("test name").password("encoded_123").name("테스트").build();

        User saveUser = userRepository.save(user);

        assertThat(saveUser.getId()).isNotNull();
        assertThat(saveUser.getUsername()).isEqualTo("test name");
        assertThat(saveUser.getName()).isEqualTo("테스트");
    }

    @Test
    @DisplayName("username으로 회원을 정상적으로 조회")
    void findByUsernameSuccess(){
        User user = User.builder().username("test name").password("encoded_456").name("테스트").build();

        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByUsername("test name");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("테스트");
    }
}
