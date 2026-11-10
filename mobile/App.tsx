import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors } from "./src/theme/colors";
import {
  getPublishedMatches,
  getTournaments,
  PublishedMatchSummary,
  TournamentSummary
} from "./src/features/home/home.repository";

export default function App() {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [matches, setMatches] = useState<PublishedMatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    try {
      setError(null);
      const [tournamentRows, matchRows] = await Promise.all([
        getTournaments(),
        getPublishedMatches()
      ]);
      setTournaments(tournamentRows);
      setMatches(matchRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load arena data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadHome();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlatList
        contentContainerStyle={styles.content}
        data={tournaments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.kicker}>THE OFFICIAL ARENA</Text>
            <Text style={styles.brand}>IMRO <Text style={styles.gold}>ESPORTS</Text></Text>
            <Text style={styles.tagline}>COMPETE. PROVE. CONQUER.</Text>
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>LIVE ARENA</Text>
              <Text style={styles.heroTitle}>Your next victory starts here.</Text>
              <Text style={styles.heroCopy}>Tournaments, match updates and your player journey — all in one native app.</Text>
              <View style={styles.stats}>
                <View><Text style={styles.statNumber}>{tournaments.length}</Text><Text style={styles.statLabel}>TOURNAMENTS</Text></View>
                <View><Text style={styles.statNumber}>{matches.length}</Text><Text style={styles.statLabel}>PUBLISHED MATCHES</Text></View>
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TOURNAMENTS</Text>
              <Text style={styles.sectionHint}>LIVE FROM IMRO DATABASE</Text>
            </View>
            {loading && <ActivityIndicator color={colors.gold} style={styles.loader} />}
            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Could not load arena</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => { setLoading(true); void loadHome(); }} style={styles.retry}>
                  <Text style={styles.retryText}>TRY AGAIN</Text>
                </Pressable>
              </View>
            )}
            {!loading && !error && tournaments.length === 0 && (
              <Text style={styles.empty}>No tournaments are available right now.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.tournamentCard}>
            <View style={styles.cardTop}>
              <Text style={styles.tournamentName}>{item.title}</Text>
              <View style={[styles.statusPill, item.registration_open ? styles.openPill : styles.closedPill]}>
                <Text style={styles.statusText}>{item.registration_open ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>Created {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>PUBLISHED MATCHES</Text>
            {matches.length === 0
              ? <Text style={styles.empty}>No published matches yet.</Text>
              : matches.slice(0, 5).map((match) => (
                <View key={match.id} style={styles.matchRow}>
                  <Text style={styles.matchTier}>TIER {match.tier} · ROUND {match.round_number}</Text>
                  <Text style={styles.matchStatus}>{match.status.toUpperCase()}</Text>
                </View>
              ))}
            <Text style={styles.footerNote}>IMRO ESPORTS · FAIR PLAY. REAL COMPETITION.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 42 },
  kicker: { color: colors.gold, fontSize: 10, letterSpacing: 4, fontWeight: "800", marginTop: 14 },
  brand: { color: colors.ivory, fontSize: 30, fontWeight: "900", marginTop: 8, letterSpacing: 0.5 },
  gold: { color: colors.gold },
  tagline: { color: colors.muted, fontSize: 10, letterSpacing: 3, marginTop: 8, fontWeight: "700" },
  hero: { marginTop: 28, padding: 22, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  heroLabel: { color: colors.crimsonBright, fontSize: 10, letterSpacing: 3, fontWeight: "900" },
  heroTitle: { color: colors.ivory, fontSize: 25, fontWeight: "900", marginTop: 12, lineHeight: 31 },
  heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  stats: { flexDirection: "row", gap: 34, marginTop: 24 },
  statNumber: { color: colors.goldLight, fontSize: 25, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1.2, marginTop: 3 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 12 },
  sectionTitle: { color: colors.ivory, fontSize: 14, fontWeight: "900", letterSpacing: 1.4 },
  sectionHint: { color: colors.muted, fontSize: 8, letterSpacing: 1 },
  loader: { marginVertical: 26 },
  tournamentCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  cardTop: { gap: 12 },
  tournamentName: { color: colors.ivory, fontSize: 16, fontWeight: "800" },
  statusPill: { alignSelf: "flex-start", borderRadius: 30, paddingHorizontal: 10, paddingVertical: 5 },
  openPill: { backgroundColor: "#123B31" },
  closedPill: { backgroundColor: "#3A2025" },
  statusText: { color: colors.ivory, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  cardMeta: { color: colors.muted, fontSize: 11, marginTop: 10 },
  empty: { color: colors.muted, fontSize: 12, marginVertical: 16 },
  errorCard: { backgroundColor: "#321A20", padding: 16, borderRadius: 12, marginTop: 12 },
  errorTitle: { color: colors.ivory, fontWeight: "800" },
  errorText: { color: "#F4C8CE", fontSize: 12, marginTop: 6 },
  retry: { marginTop: 12, alignSelf: "flex-start", padding: 10, backgroundColor: colors.crimson, borderRadius: 8 },
  retryText: { color: colors.ivory, fontWeight: "800", fontSize: 10 },
  footer: { marginTop: 28 },
  matchRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  matchTier: { color: colors.ivory, fontSize: 11, fontWeight: "700" },
  matchStatus: { color: colors.gold, fontSize: 10, fontWeight: "800" },
  footerNote: { color: colors.muted, fontSize: 9, letterSpacing: 1.2, textAlign: "center", marginTop: 36 }
});
