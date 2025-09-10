import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";

export default function MapaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A5D23" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>Tela do Mapa em Desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4A5D23",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
