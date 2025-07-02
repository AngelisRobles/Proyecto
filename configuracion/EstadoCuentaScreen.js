/*
 * Copyright (C) UDELAS - Todos Los Derechos Reservados
 * Está completemante prohibido hacer copias no autorizadas de este archivo.
 * Propietario y Confidencial
 * Escrito por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Enero 2021
 * Última modificación por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Marzo 2021
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import { Ionicons } from "@expo/vector-icons";

import * as estadoDeCuentaActions from "../../store/actions/estado-de-cuenta";
import AlertaPersonalizada from "../../components/AlertaPersonalizada";

import colores from "../../constants/colores";
import { revisarConexion } from "../../util/Util";

const { height } = Dimensions.get("window");

const EstadoCuentaScreen = ({ navigation }) => {
  const [mostrarDialogoExcepcion, setMostrarDialogoExcepcion] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );

  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  // Colores dinámicos basados en el tema
  const colorFondoGlobal =
    colorScheme === "light" ? colores.fondoClaroGlobal : colores.fondoModoOscuro;
  const colorCard = colorScheme === "light" ? "#ffffff" : "#2c2c2e";
  const colorSombra = colorScheme === "light" ? "#000" : "#000";
  const colorTexto = colorScheme === "light" ? colores.textoClaro : colores.textoOscuro;
  const colorIcono = colorScheme === "light" ? colores.primario : colores.textoClaro;
  const colorBorde = colorScheme === "light" ? "transparent" : "#3a3a3c";

  const opciones = [
    {
      titulo: "Saldo Pendiente",
      icon: "inbox-outline",
      ruta: "Saldo Pendiente",
      descripcion: "Consulta tu saldo pendiente",
    },
    {
      titulo: "Historial de Transacciones",
      icon: "bar-chart-outline",
      ruta: "Historial de Transacciones",
      descripcion: "Consulta tu historial de transacciones",
    },
  ];

  const traerDataEstadoDeCuenta = async (ruta) => {
    try {
      setMostrarDialogoExcepcion(false);
      setError("");
      setCargando(true);
      await dispatch(
        estadoDeCuentaActions.traerDataEstadoDeCuenta(dataUsuario.UserName)
      );
      setCargando(false);
      navigation.navigate(ruta);
    } catch (error) {
      setCargando(false);
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
      setMostrarDialogoExcepcion(true);
    }
  };

  const manejarDialogo = () => {
    setMostrarDialogoExcepcion(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorFondoGlobal }}>
      <StatusBar style={colorScheme === "light" ? "dark" : "light"} />

      <Spinner
        visible={cargando}
        color={colores.primario}
        animation="fade"
        size="large"
        overlayColor="rgba(0, 0, 0, 0.3)"
      />

      {/* ENCABEZADO */}
      <View style={[styles.contenedorPrincipal, { backgroundColor: colores.primario }]}>
        <View style={styles.contenedorTitulo}>
          <Text style={styles.titulo}>Estado de Cuenta</Text>
          <Image
            style={styles.imagenTitulo}
            source={
              colorScheme === "light"
                ? require("../../assets/Cuentabancaria.png")
                : require("../../assets/Cuentabancaria.png")
            }
          />
        </View>
      </View>

      {/* TARJETAS SOBRE FONDO CURVO */}
      <View
        style={[
          styles.curvedCardWrapper,
          {
            backgroundColor: colorScheme === "light" ? "#f8f9fa" : "#1c1c1e",
          },
        ]}
      >
        <View style={styles.contenedorOpciones}>
          {opciones.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => traerDataEstadoDeCuenta(item.ruta)}
              style={[
                styles.card,
                {
                  backgroundColor: colorCard,
                  shadowColor: colorSombra,
                  borderWidth: colorScheme === "light" ? 0 : 1,
                  borderColor: colorBorde,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View
                  style={[styles.iconContainer, { backgroundColor: colores.primario + "15" }]}
                >
                  <Ionicons name={item.icon} size={28} color={colorIcono} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitulo, { color: colorTexto }]}>{item.titulo}</Text>
                  <Text style={[styles.cardDescripcion, { color: colorTexto + "80" }]}>
                    {item.descripcion}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colorTexto + "60"} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Imagen decorativa en la parte inferior */}
        <View style={styles.imagenDecorativaContainer}>
          <Image
            style={styles.imagenDecorativa}
            source={
              colorScheme === "light"
                ? require("../../assets/Cuentabancaria.png")
                : require("../../assets/Cuentabancaria.png")
            }
          />
        </View>
      </View>

      <AlertaPersonalizada
        mostrarDialog={mostrarDialogoExcepcion}
        mensaje={error}
        funcion={manejarDialogo}
      />
    </SafeAreaView>
  );
};

export const screenOptions = () => {
  return { headerShown: false };
};

export default EstadoCuentaScreen;

const styles = StyleSheet.create({
  curvedCardWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.65,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  contenedorPrincipal: {
    width: "90%",
    borderRadius: 20,
    marginTop: 20,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
  },
  contenedorTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    marginRight: 15,
  },
  imagenTitulo: {
    width: 120,
    height: 90,
    resizeMode: "contain",
  },
  contenedorOpciones: {
    gap: 16,
    marginTop: 20,
    paddingHorizontal: 5,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescripcion: {
    fontSize: 14,
    opacity: 0.7,
  },
  imagenDecorativaContainer: {
    alignItems: "center",
    marginTop: 30,
    opacity: 0.3,
  },
  imagenDecorativa: {
    width: 150,
    height: 120,
    resizeMode: "contain",
  },
});
