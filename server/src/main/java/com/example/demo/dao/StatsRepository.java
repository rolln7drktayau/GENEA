package com.example.demo.dao;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.entities.Stats;

public interface StatsRepository extends MongoRepository<Stats, String> {

}
