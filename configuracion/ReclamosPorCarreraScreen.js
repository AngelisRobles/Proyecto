/*
 * Copyright (C) UDELAS - Todos Los Derechos Reservados
 * Está completemante prohibido hacer copias no autorizadas de este archivo.
 * Propietario y Confidencial
 * Escrito por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Marzo 2021
 * Última modificación por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Marzo 2021
 */

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  useColorScheme
} from "react-native";
//import { useColorScheme } from "react-native-appearance";
import { useDispatch, useSelector } from "react-redux";

import * as creditosActions from "../../store/actions/creditos";

import Periodo from "../../components/Periodo";
import FondoOpaco from "../../components/FondoOpaco";
import AlertaPersonalizada from "../../components/AlertaPersonalizada";

import colores from "../../constants/colores";
import fuente from "../../constants/fuente";

import { revisarConexion } from "../../util/Util";

const ReclamosPorCarreraScreen = ({ route, navigation }) => {
  const titulo = route.params.titulo;

  const [refreshing, setRefreshing] = useState(false);
  const [mostrarDialog, setMostrarDialog] = useState(false);
  const [error, setError] = useState("");

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );
  const reclamos = useSelector(
    (state) => state.creditos.listaDeReclamos[titulo]
  );

  const colorScheme = useColorScheme();

  const dispatch = useDispatch();

  const cargarDataReclamos = useCallback(async () => {
    try {
      setError("");
      setMostrarDialog(false);

      await dispatch(
        creditosActions.traerSolicitudesReclamoNota(dataUsuario.UserName)
      );
    } catch (error) {
      const mensajeError = revisarConexion(error.message);

      setError(mensajeError);
      setMostrarDialog(true);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    cargarDataReclamos();

    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={{
        backgroundColor:
          colorScheme === "light" ? "white" : colores.fondoModoOscuro,
      }}
      contentContainerStyle={styles.contenedorPrincipal}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contenedorCarrera}>
        <FondoOpaco estilo={{ borderRadius: 15, opacity: 0.03 }} />

        <Image
          style={styles.imagenDeFondo}
          source={require("../../assets/patron.jpg")}
        />

        <View style={styles.contenedorTitulo}>
          <Text
            style={{
              ...styles.titulo,
              marginBottom: 20,
              width: "90%",
            }}
          >
            {titulo}
          </Text>

          <Text style={styles.titulo}>Solicitudes de Reclamo de Nota</Text>
        </View>
      </View>

      <View style={styles.contenedorCreditos}>
        <View style={styles.contenedorTituloCreditos}>
          <Text style={styles.tituloCreditos}>
            SELECCIONE EL PERIODO DEL RECLAMO
          </Text>
        </View>

        <View style={styles.creditos}>
          {reclamos !== undefined &&
            Object.entries(reclamos)
              .reverse()
              .map(([k, v]) => (
                <Periodo
                  key={k}
                  titulo={k}
                  carrera={titulo}
                  navigation={navigation}
                  ruta="Detalles de Reclamos"
                />
              ))}
        </View>
      </View>

      <AlertaPersonalizada
        mostrarDialog={mostrarDialog}
        mensaje={error}
        funcion={() => setMostrarDialog(false)}
      />
    </ScrollView>
  );
};

export const screenOptions = (navData) => {
  return {
    headerBackTitle: "Atrás",
  };
};

export default ReclamosPorCarreraScreen;

const styles = StyleSheet.create({
  contenedorPrincipal: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  contenedorCarrera: {
    width: "90%",
    marginTop: 20,
    backgroundColor: colores.primario,
    borderRadius: 15,
  },
  imagenDeFondo: {
    height: "100%",
    width: "100%",
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  contenedorTitulo: {
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
  },
  titulo: {
    textAlign: "center",
    color: "white",
    fontSize: fuente.tamanoFuenteTitulo,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  contenedorCreditos: {
    width: "100%",
    alignItems: "center",
    marginTop: 25,
  },
  contenedorTituloCreditos: { width: "90%", alignItems: "flex-start" },
  tituloCreditos: {
    marginBottom: 20,
    marginLeft: 5,
    fontSize: fuente.tamanoFuenteBase,
    color: colores.primario,
    fontWeight: "bold",
  },
  creditos: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});
