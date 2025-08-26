import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { api } from "../services/api";
import Toast from "react-native-root-toast";

type Props = NativeStackScreenProps<RootStackParamList, "Checkin">;

export default function CheckinScreen({ route, navigation }: Props) {
  const { eventId, attendeeId, name, onSuccess } = route.params;

  const [loading, setLoading] = useState(false);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/events/${eventId}/checkin`, { attendeeId });
      const time = res.data.checkedInAt;
      setCheckedInAt(time);

      setUndoAvailable(true);
      const timeout = setTimeout(() => setUndoAvailable(false), 5000);
      setUndoTimeout(timeout);

      Toast.show(`${name} fez check-in!`, { duration: Toast.durations.SHORT });
      onSuccess?.();
    } catch (err: any) {
      if (err.response?.status === 409) {
        const time = err.response.data.checkedInAt;
        const localTime = new Date(time).toLocaleTimeString();
        Toast.show(`${name} já presente desde ${localTime}`, {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show("Erro ao realizar check-in.", {
          duration: Toast.durations.SHORT,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (undoTimeout) clearTimeout(undoTimeout);
    setCheckedInAt(null);
    setUndoAvailable(false);
    Toast.show(`Check-in de ${name} desfeito`, {
      duration: Toast.durations.SHORT,
    });
    onSuccess?.();
  };

  useEffect(() => {
    handleCheckin();
    return () => {
      if (undoTimeout) clearTimeout(undoTimeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {loading && <ActivityIndicator size="large" />}
      {checkedInAt && !loading && (
        <>
          <Text>
            Check-in realizado às {new Date(checkedInAt).toLocaleTimeString()}
          </Text>
          {undoAvailable && (
            <Button
              title="Desfazer"
              onPress={handleUndo}
              accessibilityLabel="Desfazer check-in"
            />
          )}
        </>
      )}

      <Button
        title="Fechar"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Fechar modal de check-in"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
