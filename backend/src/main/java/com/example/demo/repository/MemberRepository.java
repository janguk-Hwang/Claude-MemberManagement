package com.example.demo.repository;

import com.example.demo.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByName(String name);
    boolean existsByName(String name);
    Page<Member> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
