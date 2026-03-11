package com.example.demo;

import java.io.IOException;
import java.net.ServerSocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GeneaApplication {

	public static void main(String[] args) {
		int requestedPort = resolveRequestedPort();
		if (isPortAvailable(requestedPort)) {
			System.setProperty("server.port", String.valueOf(requestedPort));
		} else {
			int fallbackPort = findRandomFreePort();
			System.setProperty("server.port", String.valueOf(fallbackPort));
			System.out.println("Port " + requestedPort + " is already in use. Falling back to free port " + fallbackPort + ".");
		}

		SpringApplication.run(GeneaApplication.class, args);
	}

	private static int resolveRequestedPort() {
		String propertyPort = System.getProperty("server.port");
		if (propertyPort != null && !propertyPort.isBlank()) {
			return parsePort(propertyPort, 8080);
		}

		String envPort = System.getenv("SERVER_PORT");
		if (envPort != null && !envPort.isBlank()) {
			return parsePort(envPort, 8080);
		}

		return 8080;
	}

	private static int parsePort(String value, int fallback) {
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException ex) {
			return fallback;
		}
	}

	private static boolean isPortAvailable(int port) {
		try (ServerSocket socket = new ServerSocket(port)) {
			socket.setReuseAddress(true);
			return true;
		} catch (IOException ex) {
			return false;
		}
	}

	private static int findRandomFreePort() {
		try (ServerSocket socket = new ServerSocket(0)) {
			socket.setReuseAddress(true);
			return socket.getLocalPort();
		} catch (IOException ex) {
			throw new IllegalStateException("Unable to find a free local port.", ex);
		}
	}
}
