import React, { useState, useEffect, useCallback } from "react";
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

import AlertaPersonalizada from "../../components/AlertaPersonalizada";
import * as matriculaActions from "../../store/actions/matricula";
import colores from "../../constants/colores";
import { revisarConexion } from "../../util/Util";

const { height } = Dimensions.get("window");

const MatriculaScreen = ({ navigation }) => {
  const [mostrarDialogoExcepcion, setMostrarDialogoExcepcion] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  const colorFondoGlobal =
    colorScheme === "light" ? colores.fondoClaroGlobal : colores.fondoModoOscuro;
  const colorTexto = colorScheme === "light" ? colores.textoClaro : colores.textoOscuro;
  const colorCard = colorScheme === "light" ? "#ffffff" : "#2c2c2e";
  const colorSombra = "#000";
  const colorIcono = colorScheme === "light" ? colores.primario : colores.textoClaro;

  const procesarPago = useCallback(async () => {
    setMostrarDialogoExcepcion(false);
    setError("");
    setCargando(true);
    try {
      await dispatch(
        matriculaActions.revisarEstadoDepositosBNP(dataUsuario.UserName)
      );
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
      setMostrarDialogoExcepcion(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      procesarPago();
    });
    return unsubscribe;
  }, [navigation]);

  const traerDataMatricula = async (tipo) => {
    setMostrarDialogoExcepcion(false);
    setError("");
    setCargando(true);

    let servicio;
    switch (tipo) {
      case "Cupos":
        servicio = matriculaActions.traerCupos(dataUsuario.UserName);
        break;
      case "Documentos a Pagar":
        servicio = matriculaActions.traerDeudas(dataUsuario.UserName);
        break;
      case "Otros Pagos":
        servicio = matriculaActions.traerInstancias();
        break;
    }

    try {
      await dispatch(servicio);
      navigation.navigate(tipo);
    } catch (error) {
      const mensajeError = revisarConexion(error.message);
      setError(mensajeError);
      setMostrarDialogoExcepcion(true);
    } finally {
      setCargando(false);
    }
  };

  const opciones = [
    {
      titulo: "Matrícula / Cupos",
      tipo: "Cupos",
      icon: "school-outline",
      descripcion: "Selecciona tu cupo y realiza matrícula",
    },
    {
      titulo: "Documentos a Pagar",
      tipo: "Documentos a Pagar",
      icon: "document-text-outline",
      descripcion: "Consulta tus saldos pendientes",
    },
    {
      titulo: "Otros Pagos",
      tipo: "Otros Pagos",
      icon: "cash-outline",
      descripcion: "Paga actividades o servicios",
    },
  ];

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
          <Text style={styles.titulo}>Opciones de Matrícula</Text>
          <Image
            style={styles.imagenTitulo}
            source={
              colorScheme === "light"
                ? require("../../assets/creditos.png")
                : require("../../assets/creditos_dm.png")
            }
          />
        </View>
      </View>

      {/* TARJETAS */}
      <View style={[styles.curvedCardWrapper, {
        backgroundColor: colorScheme === "light" ? "#f8f9fa" : "#1c1c1e",
      }]}>
        <View style={styles.contenedorOpciones}>
          {opciones.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => traerDataMatricula(item.tipo)}
              style={[
                styles.card,
                {
                  backgroundColor: colorCard,
                  shadowColor: colorSombra,
                  borderWidth: colorScheme === "light" ? 0 : 1,
                  borderColor: colorScheme === "light" ? "transparent" : "#3a3a3c",
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={28} color={colorIcono} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitulo, { color: colorTexto }]}>
                    {item.titulo}
                  </Text>
                  <Text style={[styles.cardDescripcion, { color: colorTexto + "80" }]}>
                    {item.descripcion}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colorTexto + "60"} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <AlertaPersonalizada
        mostrarDialog={mostrarDialogoExcepcion}
        mensaje={error}
        funcion={() => setMostrarDialogoExcepcion(false)}
      />
    </SafeAreaView>
  );
};

export const screenOptions = () => {
  return { headerShown: false };
};

export default MatriculaScreen;

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
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colores.primario + "15",
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
});
