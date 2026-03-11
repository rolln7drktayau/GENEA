package com.example.demo.dao;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Person;

@Repository
public interface PersonRepository extends MongoRepository<Person, String> {
    List<Person> findByMotherAndFather(String mother, String father);
    Person findByEmailAndPassword(String email, String password);
    List<Person> findByMother(String motherId);
    List<Person> findByFather(String fatherId);
    List<Person> findByMotherOrFather(String id, String id2);
    Person findByEmail(String email);
}