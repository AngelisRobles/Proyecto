import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  ScrollView,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import * as LocalAuthentication from "expo-local-authentication";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import { Ionicons } from "@expo/vector-icons";

import * as autenticacionActions from "../../store/actions/autenticacion";
import * as perfilActions from "../../store/actions/perfil";
import * as configuracionActions from "../../store/actions/configuracion";

import AlertaInput from "../../components/AlertaInput";
import AlertaConfirmacion from "../../components/AlertaConfirmacion";
import AlertaPersonalizada from "../../components/AlertaPersonalizada";

import colores from "../../constants/colores";
import fuente from "../../constants/fuente";

import { revisarConexion, mostrarNotificacion } from "../../util/Util";

const { height } = Dimensions.get("window");

const ConfiguracionScreen = ({ navigation }) => {
  const [mostrarDialog, setMostrarDialog] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarDialogError, setMostrarDialogError] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [rutaNavegar, setRutaNavegar] = useState("");
  const [cedula, setCedula] = useState("");
  const [mostrarDialogoExcepcion, setMostrarDialogoExcepcion] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const dataUsuario = useSelector(
    (state) => state.autenticacion.usuarioAutenticado
  );
  const dataPerfilUsuario = useSelector(
    (state) => state.perfil.dataPerfilUsuario
  );

  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const toast = useToast();

  // Colores dinámicos basados en el tema
  const colorFondoGlobal =
    colorScheme === "light" ? colores.fondoClaroGlobal : colores.fondoModoOscuro;
  const colorTexto =
    colorScheme === "light" ? colores.textoClaro : colores.textoOscuro;
  const colorCard = colorScheme === "light" ? "#ffffff" : "#2c2c2e";
  const colorSombra = colorScheme === "light" ? "#000" : "#000";
  const colorIcono = colorScheme === "light" ? colores.primario : colores.primario;

  const confirmarIdentidad = async (ruta, mostrarDialog) => {
    let tieneBiometrics = await LocalAuthentication.hasHardwareAsync();
    let tieneBiometricsRegistrado = await LocalAuthentication.isEnrolledAsync();

    if (tieneBiometrics && tieneBiometricsRegistrado) {
      let result = await LocalAuthentication.authenticateAsync();

      if (result.success) {
        navigation.navigate(ruta);
      } else {
        mostrarNotificacion(
          "Falló la verificación de identidad. Intenta nuevamente.",
          "NOOK",
          3000,
          "information-circle-outline",
          colores.primario,
          colorScheme,
          toast
        );
      }
    } else {
      setRutaNavegar(ruta);
      setMostrarDialog(mostrarDialog);
    }
  };

  const introducirCedula = () => {
    if (cedula === "") {
      setDialogError("Debe introducir una cédula para continuar...");
      setMostrarDialogError(true);
    } else if (dataPerfilUsuario.DNI !== cedula) {
      setDialogError("La cédula introducida no es válida...");
      setMostrarDialogError(true);
    } else {
      limpiarDialogo();
      navigation.navigate(rutaNavegar);
    }
  };

  const limpiarDialogo = () => {
    setMostrarDialogError(false);
    setDialogError("");
    setCedula("");
    setMostrarDialog(false);
  };

  const cargarInformacionConfiguracion = useCallback(async (
    servicio,
    ruta,
    mensajeAdicional = "",
    validarIdentidad = false
  ) => {
    try {
      setMostrarDialogoExcepcion(false);
      setError("");

      setCargando(true);

      await dispatch(servicio);

      setCargando(false);

      if (ruta !== "" && !validarIdentidad) {
        navigation.navigate(ruta);
      } else if (ruta !== "" && validarIdentidad) {
        confirmarIdentidad(ruta, true);
      }
    } catch (error) {
      setCargando(false);

      const mensajeError = revisarConexion(
        error.message,
        `${error.message}${mensajeAdicional}`
      );

      setError(mensajeError);
      setMostrarDialogoExcepcion(true);
    }
  }, [dataUsuario.UserName, dispatch, navigation]);

  const cerrarSesion = () => {
    setMostrarConfirmacion(false);
    dispatch(autenticacionActions.cerrarSesion());
  };

  const manejarDialogo = useCallback(() => {
    setMostrarDialogoExcepcion(false);
  }, []);

  const opcionesConfiguracion = [
    {
      titulo: "Cambiar Datos de Perfil",
      descripcion: "Actualiza tu información personal",
      icon: "person-outline",
      funcion: () => {
        const servicio = perfilActions.cargarDataPerfil(dataUsuario.UserName);
        cargarInformacionConfiguracion(
          servicio,
          "Actualizar Datos Perfil",
          " Por favor intente nuevamente."
        );
      },
    },
    {
      titulo: "Cambiar Contraseña",
      descripcion: "Modifica tu contraseña de acceso",
      icon: "lock-closed-outline",
      funcion: () => {
        const servicio = autenticacionActions.cargarInfoSesionUsuario(
          dataUsuario.UserName
        );
        cargarInformacionConfiguracion(servicio, "Cambiar Contraseña", "", true);
      },
    },
    {
      titulo: "Datos de Inicio de Sesión",
      descripcion: "Consulta tu información de sesión",
      icon: "log-in-outline",
      funcion: () => {
        const servicio = autenticacionActions.cargarInfoSesionUsuario(
          dataUsuario.UserName
        );
        cargarInformacionConfiguracion(servicio, "Datos de Sesión", "", true);
      },
    },
    {
      titulo: "Carnet Virtual",
      descripcion: "Ver tu carnet de estudiante digital",
      icon: "card-outline",
      funcion: () => {
        const servicio = perfilActions.cargarDataPerfil(dataUsuario.UserName);
        cargarInformacionConfiguracion(
          servicio,
          "Carnet Virtual",
          " Por favor intente nuevamente."
        );
      },
    },
    {
      titulo: "Ayuda",
      descripcion: "Preguntas frecuentes y soporte",
      icon: "help-circle-outline",
      funcion: () => {
        const servicio = configuracionActions.traerDataPreguntasFrequentes();
        cargarInformacionConfiguracion(servicio, "Ayuda");
      },
    },
    {
      titulo: "Acerca De",
      descripcion: "Información de la aplicación",
      icon: "information-circle-outline",
      funcion: () => navigation.navigate("Acerca De"),
    },
    {
      titulo: "Cerrar Sesión",
      descripcion: "Salir de tu cuenta",
      icon: "log-out-outline",
      isLogout: true,
      funcion: () => {
        setMostrarConfirmacion(true);
      },
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

      {/* ENCABEZADO CON PERFIL */}
      <View
        style={[
          styles.contenedorPrincipal,
          {
            backgroundColor: colores.primario,
          },
        ]}
      >
        <View style={styles.contenedorPerfil}>
          <Image
            style={styles.imagenPerfil}
            source={{ uri: dataPerfilUsuario.FotoPerfil }}
          />
          <View style={styles.infoPerfil}>
            <Text style={styles.textoPerfilNombre}>
              {dataPerfilUsuario.Nombre} {dataPerfilUsuario.Apellido}
            </Text>
            <Text style={styles.textoPerfilSubtitulo}>
              Configuración de cuenta
            </Text>
          </View>
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
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contenedorOpciones}
        >
          {opcionesConfiguracion.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.funcion}
              style={[
                styles.card,
                {
                  backgroundColor: item.isLogout 
                    ? (colorScheme === "light" ? "#fff5f5" : "#2d1b1b")
                    : colorCard,
                  shadowColor: colorSombra,
                  borderWidth: colorScheme === "light" ? 0 : 1,
                  borderColor: item.isLogout
                    ? (colorScheme === "light" ? "#fed7d7" : "#553c4e")
                    : (colorScheme === "light" ? "transparent" : "#3a3a3c"),
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={[
                  styles.iconContainer,
                  {
                    backgroundColor: item.isLogout 
                      ? "#ef444415" 
                      : colores.primario + "15"
                  }
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.isLogout ? "#ef4444" : colorIcono}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.cardTitulo, 
                    { 
                      color: item.isLogout 
                        ? (colorScheme === "light" ? "#dc2626" : "#fca5a5")
                        : colorTexto 
                    }
                  ]}>
                    {item.titulo}
                  </Text>
                  <Text style={[
                    styles.cardDescripcion, 
                    { 
                      color: item.isLogout 
                        ? (colorScheme === "light" ? "#dc262680" : "#fca5a580")
                        : colorTexto + "80" 
                    }
                  ]}>
                    {item.descripcion}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={item.isLogout 
                    ? (colorScheme === "light" ? "#dc262660" : "#fca5a560")
                    : colorTexto + "60"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <AlertaInput
        mostrarDialog={mostrarDialog}
        titulo="Confirmación de Identidad"
        mensaje="Introduzca su cédula para confirmar su identidad."
        dialogError={dialogError}
        mostrarDialogError={mostrarDialogError}
        valorInput={cedula}
        setValorInput={setCedula}
        placeholderInput="0-000-0000"
        esMultiLinea={false}
        limpiarDialogo={limpiarDialogo}
        funcion={introducirCedula}
      />
      <AlertaConfirmacion
        mostrarDialog={mostrarConfirmacion}
        setMostrarDialogo={setMostrarConfirmacion}
        titulo="Cerrar Sesión"
        mensajeConfirmacion="¿Estás seguro/a que deseas cerrar sesión?"
        funcion={cerrarSesion}
      />
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

export default ConfiguracionScreen;

const styles = StyleSheet.create({
  curvedCardWrapper: {
    flex: 1,
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contenedorPrincipal: {
    width: "90%",
    borderRadius: 20,
    marginTop: 40,
    marginBottom: 10,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
    paddingVertical: 30,
    paddingHorizontal: 25,
    minHeight: 120,
  },
  contenedorPerfil: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagenPerfil: { 
    width: 80, 
    height: 80, 
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  infoPerfil: {
    flex: 1,
    marginLeft: 16,
  },
  textoPerfilNombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  textoPerfilSubtitulo: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
  },
  contenedorOpciones: {
    gap: 14,
    paddingTop: 5,
    paddingBottom: 30,
  },
  card: {
    padding: 18,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardDescripcion: {
    fontSize: 14,
    opacity: 0.8,
  },
});