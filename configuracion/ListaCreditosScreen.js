/*
 * Copyright (C) UDELAS - Todos Los Derechos Reservados
 * Está completemante prohibido hacer copias no autorizadas de este archivo.
 * Propietario y Confidencial
 * Escrito por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Febrero 2021
 * Última modificación por Johnny Navarro <johnny.navarro@udelas.ac.pa>, Febrero 2021
 */

import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as creditosActions from "../../store/actions/creditos";
import AlertaPersonalizada from "../../components/AlertaPersonalizada";
import CarreraCreditos from "../../components/CarreraCreditos";
import colores from "../../constants/colores";
import fuente from "../../constants/fuente";
import { revisarConexion } from "../../util/Util";

const ListaCreditosScreen = ({ navigation }) => {
  const [mostrarDialog, setMostrarDialog] = useState(false);
  const [error, setError] = useState("");
  const [error2, setError2] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );
  const carrerasPorEstudiante = useSelector(
    (state) => state.creditos.carrerasPorEstudiante
  );
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  const cargarDataInicial = useCallback(async () => {
    setError("");
    try {
      await dispatch(
        creditosActions.traerCarrerasEstudiante(dataUsuario.UserName)
      );
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    cargarDataInicial();
    setRefreshing(false);
  }, []);

  const cargarDataCarrera = async (carrera, codcarrera) => {
    if (!carrera || !codcarrera) {
      setError2("Datos inválidos para cargar la carrera.");
      setMostrarDialog(true);
      return;
    }

    try {
      setError2("");
      setMostrarDialog(false);
      await dispatch(
        creditosActions.traerDataCarrera(dataUsuario.UserName, codcarrera)
      );
      navigation.navigate("Créditos Por Carrera", {
        titulo: carrera,
        codcarrera: codcarrera,
      });
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError2(mensajeError);
      setMostrarDialog(true);
    }
  };

  return (
    <View
      style={{
        ...styles.contenedorPrincipal,
        backgroundColor: colorScheme === "light" ? colores.primario : colores.primario,
      }}
    >
      <View style={styles.contenedorSuperior}>
        <Text style={styles.titulo}>Carreras del Estudiante</Text>
        <Image
          style={styles.imagen}
          source={
            colorScheme === "light"
              ? require("../../assets/creditos.png")
              : require("../../assets/creditos_dm.png")
          }
        />
      </View>

      <View
        style={{
          ...styles.contenedorInferior,
          backgroundColor:
            colorScheme === "light" ? "white" : colores.fondoModoOscuro,
        }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.contenedorTituloCupos}>
            <Text style={styles.tituloCupos}>SELECCIONAR CARRERA</Text>
          </View>

          {carrerasPorEstudiante.length === 0 ? (
            <Text
              style={{
                ...styles.error,
                color:
                  colorScheme === "light"
                    ? colores.error
                    : colores.fondoOscuroTextoPrimario,
              }}
            >
              Usted no posee créditos registrados aún.
            </Text>
          ) : (
            <>
              {error !== "" ? (
                <Text
                  style={{
                    ...styles.error,
                    color:
                      colorScheme === "light"
                        ? colores.error
                        : colores.fondoOscuroTextoPrimario,
                  }}
                >
                  {error}
                </Text>
              ) : (
                <View>
                  {carrerasPorEstudiante.map((c) => (
                    <CarreraCreditos
                      key={c.Cod_carrera}
                      carrera={c}
                      cargarDataCarrera={cargarDataCarrera}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <AlertaPersonalizada
        mostrarDialog={mostrarDialog}
        mensaje={error2}
        funcion={() => setMostrarDialog(false)}
      />
    </View>
  );
};

export default ListaCreditosScreen;

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: colores.primario,
  },
  contenedorSuperior: {
    width: "100%",
    height: "30%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  titulo: {
    width: "35%",
    color: "white",
    fontSize: fuente.tamanoFuenteTitulo,
    fontWeight: "bold",
  },
  imagen: { width: 170, height: 120 },
  contenedorInferior: {
    width: "100%",
    height: "70%",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  scroll: {
    alignItems: "center",
    marginTop: 35,
    paddingBottom: 35,
  },
  contenedorTituloCupos: { width: "90%", alignItems: "flex-start" },
  tituloCupos: {
    marginBottom: 20,
    marginLeft: 5,
    fontSize: fuente.tamanoFuenteBase,
    color: colores.primario,
    fontWeight: "bold",
  },
  error: {
    fontSize: fuente.tamanoFuenteBase,
    fontWeight: "bold",
    textAlign: "center",
  },
});