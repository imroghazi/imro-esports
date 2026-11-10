import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { colors } from "./src/theme/colors";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <Text style={styles.kicker}>THE OFFICIAL ARENA</Text>
        <Text style={styles.title}>IMRO <Text style={styles.gold}>ESPORTS</Text></Text>
        <View style={styles.rule} />
        <Text style={styles.subtitle}>COMPETE. PROVE. CONQUER.</Text>
        <Text style={styles.note}>Native app foundation is ready.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  kicker: { color: colors.gold, fontSize: 11, letterSpacing: 4, fontWeight: "700", marginBottom: 16 },
  title: { color: colors.ivory, fontSize: 34, fontWeight: "900", letterSpacing: 1 },
  gold: { color: colors.gold },
  rule: { width: 92, height: 3, backgroundColor: colors.crimson, marginVertical: 22, borderRadius: 4 },
  subtitle: { color: colors.ivory, fontSize: 12, letterSpacing: 3, fontWeight: "700" },
  note: { color: colors.muted, fontSize: 12, marginTop: 48 }
});
