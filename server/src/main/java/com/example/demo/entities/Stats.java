package com.example.demo.entities;

import java.io.Serializable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
// @SuppressWarnings("serial")
@Document(collection = "stats")
public class Stats implements Serializable {

    @Id
    @JsonProperty("id")
    @Indexed(unique = true)
    private String id;

    private int connections, males, females, memories;

    public Stats() {
        super();
    }

    public Stats(Stats stats) {
        this.connections = stats.connections;
        this.males = stats.males;
        this.females = stats.females;
        this.memories = stats.memories;
    }

    public Stats(String id, int connections, int males, int females, int memories) {
        this.id = id;
        this.connections = connections;
        this.males = males;
        this.females = females;
        this.memories = memories;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getConnections() {
        return connections;
    }

    public void setConnections(int connections) {
        this.connections = connections;
    }

    public int getMales() {
        return males;
    }

    public void setMales(int males) {
        this.males = males;
    }

    public int getFemales() {
        return females;
    }

    public void setFemales(int females) {
        this.females = females;
    }

    public int getMemories() {
        return memories;
    }

    public void setMemories(int memories) {
        this.memories = memories;
    }
}
