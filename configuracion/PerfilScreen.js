// PerfilScreen.js sin animaciones y con colores corregidos

import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import * as autenticacionActions from "../store/actions/autenticacion";
import * as perfilActions from "../store/actions/perfil";

import AlertaPersonalizada from "../components/AlertaPersonalizada";

import colores from "../constants/colores";
import { revisarConexion } from "../util/Util";

const { height, width } = Dimensions.get("window");

const PerfilScreen = () => {
  const [mostrarDialog, setMostrarDialog] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dataUsuario = useSelector((state) => state.autenticacion.usuarioAutenticado);
  const dataPerfilUsuario = useSelector((state) => state.perfil.dataPerfilUsuario);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const colorFondoGlobal = isDark ? '#0a0a0a' : '#f8fafc';
  const colorTexto = isDark ? '#ffffff' : '#1e293b';
  const colorTextoSecundario = isDark ? '#94a3b8' : '#64748b';
  const colorCard = isDark ? '#1e293b' : '#ffffff';
  const colorSombra = isDark ? '#000000' : '#e2e8f0';
  const colorAccent = '#3b82f6';

  const cargarDataPerfil = useCallback(async () => {
    try {
      setError("");
      setMostrarDialog(false);
      await dispatch(perfilActions.cargarDataPerfil(dataUsuario.UserName));
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
      setMostrarDialog(true);
    }
  }, [dispatch, dataUsuario.UserName]);

  useEffect(() => {
    cargarDataPerfil();
  }, [cargarDataPerfil]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarDataPerfil();
    setRefreshing(false);
  }, [cargarDataPerfil]);

  const InfoCard = ({ icon, title, value, color = colorAccent }) => (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: colorCard,
          shadowColor: colorSombra,
          borderWidth: 1,
          borderColor: isDark ? '#334155' : '#e2e8f0',
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoTitle, { color: colorTextoSecundario }]}>{title}</Text>
        <Text style={[styles.infoValue, { color: colorTexto }]}>{value}</Text>
      </View>
    </View>
  );

  const StatCard = ({ title, value, icon, gradient }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <View style={styles.statContent}>
          <Ionicons name={icon} size={28} color="white" />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorFondoGlobal }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colorAccent}
            colors={[colorAccent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#60a5fa', '#3b82f6', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modernHeader}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  style={styles.avatar}
                  source={require("../assets/logo.png")}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>¡Hola!</Text>
                <Text style={styles.userName}>
                  {dataPerfilUsuario.Nombre} {dataPerfilUsuario.Apellido}
                </Text>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Ionicons name="school" size={12} color="white" />
                    <Text style={styles.badgeText}>Estudiante</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Facultad"
            value={dataPerfilUsuario.CarreraActual?.substring(0, 15) + "..." || "N/A"}
            icon="school"
            gradient={['#60a5fa', '#3b82f6']}
          />
          <StatCard
            title="Estado"
            value="Activo"
            icon="checkmark-circle"
            gradient={['#93c5fd', '#60a5fa']}
          />
        </View>

        {/* INFORMACIÓN PERSONAL */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colorTexto }]}>Información Personal</Text>
            <View style={[styles.sectionLine, { backgroundColor: colorAccent }]} />
          </View>
          <InfoCard icon="card" title="Cédula" value={dataPerfilUsuario.DNI || "N/A"} color="#3b82f6" />
          <InfoCard icon="call" title="Teléfonos" value={dataPerfilUsuario.Telefonos || "N/A"} color="#60a5fa" />
          <InfoCard icon="mail" title="Correo Electrónico" value={dataPerfilUsuario.Email || "N/A"} color="#1e40af" />
          <InfoCard icon="location" title="Dirección" value={dataPerfilUsuario.Direccion || "N/A"} color="#2563eb" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ALERTA DE ERROR */}
      <AlertaPersonalizada
        mostrarDialog={mostrarDialog}
        mensaje={error}
        funcion={() => {
          setMostrarDialog(false);
          dispatch(autenticacionActions.cerrarSesion());
        }}
      />
    </SafeAreaView>
  );
};

export const screenOptions = () => ({ headerShown: false });

export default PerfilScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20, flexGrow: 1 },
  modernHeader: {
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: { flex: 1, marginLeft: 20 },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
  userName: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  badgeContainer: { flexDirection: 'row', marginTop: 8 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statContent: { alignItems: 'center' },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  statTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginRight: 15 },
  sectionLine: { flex: 1, height: 2, borderRadius: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '500' },
});