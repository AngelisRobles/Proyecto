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

import CarreraReclamos from "../../components/CarreraReclamos";

import colores from "../../constants/colores";
import fuente from "../../constants/fuente";

import { revisarConexion } from "../../util/Util";

const ListaReclamosScreen = ({ navigation }) => {
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );
  const listaDeReclamos = useSelector(
    (state) => state.creditos.listaDeReclamos
  );

  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  // Colores y estilos dinámicos idénticos a ListaCreditosScreen
  const colorFondoPrincipal = colores.primario;
  const colorFondoInferior =
    colorScheme === "light" ? "white" : colores.fondoModoOscuro;

  const colorCard = colorScheme === "light" ? "#fff" : "#2c2c2e";
  const colorTextoError =
    colorScheme === "light" ? colores.error : colores.fondoOscuroTextoPrimario;

  const cargarDataReclamos = useCallback(async () => {
    setError("");
    try {
      await dispatch(
        creditosActions.traerSolicitudesReclamoNota(dataUsuario.UserName)
      );
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
    }
  }, [dataUsuario.UserName, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarDataReclamos();
    setRefreshing(false);
  }, [cargarDataReclamos]);

  return (
    <View style={[styles.contenedorPrincipal, { backgroundColor: colorFondoPrincipal }]}>
      {/* Contenedor superior */}
      <View style={styles.contenedorSuperior}>
        <Text style={styles.titulo}>Carreras del Estudiante</Text>
        <Image
          style={styles.imagen}
          source={
            colorScheme === "light"
              ? require("../../assets/reclamos.png")
              : require("../../assets/reclamos_dm.png")
          }
        />
      </View>

      {/* Contenedor inferior curvado con scroll */}
      <View style={[styles.contenedorInferior, { backgroundColor: colorFondoInferior }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contenedorTituloCupos}>
            <Text style={[styles.tituloCupos, { color: colorFondoPrincipal }]}>
              SELECCIONAR CARRERA
            </Text>
          </View>

          {/* Mensajes si no hay reclamos o error */}
          {Object.keys(listaDeReclamos).length === 0 &&
          listaDeReclamos.constructor === Object ? (
            <View style={[styles.card, { backgroundColor: colorCard }]}>
              <Text style={[styles.error, { color: colorTextoError }]}>
                Usted no posee ninguna solicitud de reclamo de nota aún.
              </Text>
            </View>
          ) : error !== "" ? (
            <View style={[styles.card, { backgroundColor: colorCard }]}>
              <Text style={[styles.error, { color: colorTextoError }]}>{error}</Text>
            </View>
          ) : (
            Object.entries(listaDeReclamos).map(([key]) => (
              <View key={key} style={[styles.card, { backgroundColor: colorCard }]}>
                <CarreraReclamos carrera={key} navigation={navigation} />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default ListaReclamosScreen;

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    width: "100%",
  },
  contenedorSuperior: {
    width: "100%",
    height: "30%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colores.primario,
  },
  titulo: {
    width: "35%",
    color: "white",
    fontSize: fuente.tamanoFuenteTitulo,
    fontWeight: "bold",
  },
  imagen: {
    width: 170,
    height: 120,
    resizeMode: "contain",
  },
  contenedorInferior: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 35,
    paddingHorizontal: 20,
    // sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scroll: {
    paddingBottom: 35,
  },
  contenedorTituloCupos: {
    width: "90%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  tituloCupos: {
    fontSize: fuente.tamanoFuenteBase,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    fontSize: fuente.tamanoFuenteBase,
    fontWeight: "bold",
    textAlign: "center",
  },
});
