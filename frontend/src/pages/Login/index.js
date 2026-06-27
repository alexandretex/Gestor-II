import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import LanguageIcon from "@material-ui/icons/Translate";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";
import { messages } from "../../translate/languages";

import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";
import { getBackendURL } from "../../services/config";
import ColorModeContext from "../../layout/themeContext";
import { loadJSON } from "../../helpers/loadJSON";

const gitinfo = loadJSON("/gitinfo.json");

const parseLoginLinks = value => {
  if (!value) return [];
  try {
    const parsedValue = JSON.parse(value);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.filter(
      link => typeof link?.title === "string" && typeof link?.url === "string"
    );
  } catch {
    return [];
  }
};

const isVideoFile = (filename = "") => /\.(mp4|webm|ogg)$/i.test(filename);

const getPublicAssetUrl = filename => {
  if (!filename) return "";
  return `${getBackendURL()}/public/${filename}`;
};

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  backgroundLayer: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 25%, ${theme.palette.primary.main}55 50%, ${theme.palette.background.default} 75%, ${theme.palette.background.default} 100%)`,
    backgroundSize: "300% 300%",
    animation: "$gradientDrift 20s ease-in-out infinite",
    willChange: "background-position",
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none"
    }
  },
  backgroundLayerImage: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: "none",
    willChange: "auto"
  },
  backgroundOverlay: {
    position: "absolute",
    inset: 0,
    background:
      theme.palette.type === "light"
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.3)",
    backdropFilter: "blur(2px)"
  },
  backgroundVideo: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  content: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    overflowY: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1.5)
    }
  },
  topActions: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 10,
    display: "flex",
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      top: theme.spacing(1),
      right: theme.spacing(1),
      gap: theme.spacing(0.5)
    }
  },
  topActionBtn: {
    color: theme.palette.type === "light" ? "#142033" : "#fff",
    background:
      theme.palette.type === "light"
        ? "rgba(255,255,255,0.72)"
        : "rgba(6,12,22,0.55)",
    border:
      theme.palette.type === "light"
        ? "1px solid rgba(255,255,255,0.82)"
        : "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    transition: "all 200ms ease",
    "&:hover": {
      background:
        theme.palette.type === "light"
          ? "rgba(255,255,255,0.9)"
          : "rgba(10,18,31,0.7)",
      transform: "scale(1.05)"
    }
  },
  langMenu: {
    zIndex: 20
  },
  langMenuPaper: {
    minWidth: 160,
    borderRadius: 12,
    overflow: "hidden",
    background:
      theme.palette.type === "light"
        ? "rgba(255,255,255,0.95)"
        : "rgba(30,30,30,0.95)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${theme.palette.backgroundContrast.border}`
  },
  layout: {
    width: "100%",
    maxWidth: 980,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2.5),
    [theme.breakpoints.down("sm")]: {
      maxWidth: 420
    }
  },
  loginBox: {
    width: "fit-content",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      theme.palette.type === "light"
        ? "0 32px 80px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.06)"
        : "0 32px 80px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2)",
    border: `1px solid ${theme.palette.backgroundContrast.border}`,
    animation: "$cardEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      maxWidth: 420,
      borderRadius: 24
    },
    [theme.breakpoints.down("xs")]: {
      borderRadius: 20
    }
  },
  mediaPane: {
    position: "relative",
    flex: "0 0 clamp(280px, 34vw, 360px)",
    alignSelf: "stretch",
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  sidePanelImage: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  formColumn: {
    flex: "0 0 420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },
  formCardWrap: {
    width: "100%"
  },
  paper: {
    width: "100%",
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "36px 36px 32px",
    minHeight: 0,
    borderRadius: 0,
    boxShadow: "none",
    border: "none",
    [theme.breakpoints.down("xs")]: {
      padding: "28px 20px 24px"
    },
    [theme.breakpoints.down("sm")]: {
      padding: "32px 28px 28px"
    }
  },
  logoWrap: {
    marginBottom: theme.spacing(1)
  },
  logoImg: {
    width: "100%",
    maxWidth: 180,
    margin: "0 auto",
    display: "block",
    content: `url("${theme.calculatedLogo()}")`
  },
  welcomeText: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5)
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2)
  },
  inputField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor:
        theme.palette.type === "light"
          ? "rgba(0,0,0,0.02)"
          : "rgba(255,255,255,0.04)",
      transition: "background-color 200ms ease, box-shadow 200ms ease",
      "&:hover": {
        backgroundColor:
          theme.palette.type === "light"
            ? "rgba(0,0,0,0.04)"
            : "rgba(255,255,255,0.06)"
      },
      "&.Mui-focused": {
        backgroundColor: "transparent",
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`
      },
      "& fieldset": {
        borderWidth: 1.5,
        borderColor:
          theme.palette.type === "light"
            ? "rgba(0,0,0,0.12)"
            : "rgba(255,255,255,0.15)"
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5
      }
    },
    "& .MuiInputBase-input": {
      paddingTop: 16,
      paddingBottom: 16
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 18px) scale(1)",
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)"
      }
    }
  },
  submitBtn: {
    margin: theme.spacing(2.5, 0, 0.5),
    padding: "12px 0",
    borderRadius: 12,
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: "none",
    boxShadow: `0 8px 24px ${theme.palette.primary.main}33`,
    transition: "all 250ms ease",
    "&:hover": {
      boxShadow: `0 12px 32px ${theme.palette.primary.main}55`,
      transform: "translateY(-1px)"
    },
    "&.Mui-disabled": {
      boxShadow: "none"
    }
  },
  signupRow: {
    marginTop: theme.spacing(1),
    justifyContent: "center"
  },
  linksContainer: {
    width: "100%",
    maxWidth: 980,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      maxWidth: 420
    }
  },
  footerLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    padding: theme.spacing(1, 2.5),
    borderRadius: 999,
    textDecoration: "none",
    color: theme.palette.type === "light" ? "#142033" : "#fff",
    fontWeight: 600,
    fontSize: "0.85rem",
    letterSpacing: 0.2,
    lineHeight: 1.25,
    textAlign: "center",
    background:
      theme.palette.type === "light"
        ? "rgba(255,255,255,0.72)"
        : "rgba(6,12,22,0.62)",
    border:
      theme.palette.type === "light"
        ? "1px solid rgba(255,255,255,0.82)"
        : "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      theme.palette.type === "light"
        ? "0 12px 28px rgba(45, 67, 89, 0.10)"
        : "none",
    backdropFilter: "blur(14px)",
    transition: "all 200ms ease",
    "&:hover": {
      transform: "translateY(-2px)",
      background:
        theme.palette.type === "light"
          ? "rgba(255,255,255,0.9)"
          : "rgba(10,18,31,0.78)",
      boxShadow:
        theme.palette.type === "light"
          ? "0 16px 36px rgba(45, 67, 89, 0.14)"
          : "none",
      textDecoration: "none"
    }
  },
  versionInfo: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(1.25),
    zIndex: 2,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: 0.5,
    textAlign: "right",
    color: theme.palette.type === "light" ? "#0e1726" : "#ffffff",
    textShadow:
      theme.palette.type === "light"
        ? "0 1px 3px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)"
        : "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)",
    [theme.breakpoints.down("xs")]: {
      right: theme.spacing(1),
      bottom: theme.spacing(0.75),
      fontSize: "10px"
    }
  },
  "@keyframes gradientDrift": {
    "0%": { backgroundPosition: "0% 50%" },
    "25%": { backgroundPosition: "100% 0%" },
    "50%": { backgroundPosition: "100% 100%" },
    "75%": { backgroundPosition: "0% 100%" },
    "100%": { backgroundPosition: "0% 50%" }
  },
  "@keyframes cardEntrance": {
    from: {
      opacity: 0,
      transform: "translateY(20px) scale(0.97)"
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(1)"
    }
  }
}));

const Login = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { getPublicSetting } = useSettings();
  const { colorMode } = useContext(ColorModeContext);

  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const currentLanguage =
    localStorage.getItem("language") || i18n.language || "en";

  const handleChooseLanguage = useCallback(lang => {
    setLangMenuAnchor(null);
    localStorage.setItem("language", lang);
    window.location.reload(false);
  }, []);

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowSignup, setAllowSignup] = useState(false);
  const [loginLinks, setLoginLinks] = useState([]);
  const [sidePanelImage, setSidePanelImage] = useState("");
  const [backgroundContent, setBackgroundContent] = useState("");

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = useCallback(event => {
    setUser(prev => ({ ...prev, [event.target.name]: event.target.value.trim() }));
  }, []);

  const handlSubmit = useCallback(
    async event => {
      event.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        await handleLogin(user);
      } catch {
        // handled by AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleLogin, user, isSubmitting]
  );

  useEffect(() => {
    Promise.all([
      getPublicSetting("allowSignup"),
      getPublicSetting("loginPageLinks"),
      getPublicSetting("loginSidePanelImage"),
      getPublicSetting("loginBackgroundContent")
    ])
      .then(
        ([
          allowSignupValue,
          loginLinksValue,
          sidePanelImageValue,
          backgroundContentValue
        ]) => {
          setAllowSignup(allowSignupValue === "enabled");
          setLoginLinks(parseLoginLinks(loginLinksValue));
          setSidePanelImage(sidePanelImageValue || "");
          setBackgroundContent(backgroundContentValue || "");
        }
      )
      .catch(error => {
        console.log("Error reading setting", error);
      });
  }, [getPublicSetting]);

  const backgroundAssetUrl = getPublicAssetUrl(backgroundContent);
  const sidePanelImageUrl = getPublicAssetUrl(sidePanelImage);
  const shouldRenderBackgroundVideo = isVideoFile(backgroundContent);
  const showSidePanelImage = !!sidePanelImageUrl;
  const isLightMode = theme.palette.type === "light";

  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.topActions}>
        <IconButton
          className={classes.topActionBtn}
          onClick={event => setLangMenuAnchor(event.currentTarget)}
          aria-label={i18n.t("mainDrawer.appBar.i18n.language")}
          size="small"
        >
          <LanguageIcon fontSize="small" />
        </IconButton>
        <IconButton
          className={classes.topActionBtn}
          onClick={colorMode.toggleColorMode}
          aria-label={
            isLightMode ? "Switch to dark mode" : "Switch to light mode"
          }
          size="small"
        >
          {isLightMode ? (
            <Brightness4Icon fontSize="small" />
          ) : (
            <Brightness7Icon fontSize="small" />
          )}
        </IconButton>
      </div>
      <Popover
        className={classes.langMenu}
        open={Boolean(langMenuAnchor)}
        anchorEl={langMenuAnchor}
        onClose={() => setLangMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 180 }}
        PaperProps={{
          style: {
            marginTop: 6,
            overflow: "visible",
            background: "transparent",
            boxShadow: "none"
          }
        }}
        disableScrollLock
      >
        <Paper className={classes.langMenuPaper} elevation={8}>
          <MenuList>
            {Object.keys(messages).map(lang => (
              <MenuItem
                key={lang}
                onClick={() => handleChooseLanguage(lang)}
                selected={currentLanguage === lang}
                style={{
                  fontWeight: currentLanguage === lang ? 700 : 400
                }}
              >
                {messages[lang].translations.mainDrawer.appBar.i18n.language}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popover>
      {shouldRenderBackgroundVideo ? (
        <>
          <video
            className={classes.backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={backgroundAssetUrl} />
          </video>
          <div className={classes.backgroundOverlay} />
        </>
      ) : (
        <div
          className={`${classes.backgroundLayer}${backgroundAssetUrl ? ` ${classes.backgroundLayerImage}` : ""}`}
          style={
            backgroundAssetUrl
              ? { backgroundImage: `url("${backgroundAssetUrl}")` }
              : undefined
          }
        />
      )}
      <div className={classes.content}>
        <div
          className={classes.layout}
          style={!showSidePanelImage ? { maxWidth: 440 } : undefined}
        >
          <div
            className={classes.loginBox}
            style={!showSidePanelImage ? { maxWidth: 420 } : undefined}
          >
            {showSidePanelImage && (
              <div className={classes.mediaPane}>
                <img
                  className={classes.sidePanelImage}
                  src={sidePanelImageUrl}
                  alt={i18n.t("login.title")}
                />
              </div>
            )}
            <div className={classes.formColumn}>
              <div className={classes.formCardWrap}>
                <div className={classes.paper}>
                  <div className={classes.logoWrap}>
                    <img
                      className={classes.logoImg}
                      alt={i18n.t("login.title")}
                    />
                  </div>
                  <Typography className={classes.welcomeText} variant="h5">
                    {i18n.t("login.title")}
                  </Typography>
                  <form
                    className={classes.form}
                    noValidate
                    onSubmit={handlSubmit}
                  >
                    <TextField
                      className={classes.inputField}
                      variant="outlined"
                      margin="dense"
                      required
                      fullWidth
                      id="email"
                      label={i18n.t("login.form.email")}
                      name="email"
                      value={user.email}
                      onChange={handleChangeInput}
                      autoComplete="email"
                      autoFocus
                    />
                    <TextField
                      className={classes.inputField}
                      variant="outlined"
                      margin="dense"
                      required
                      fullWidth
                      name="password"
                      label={i18n.t("login.form.password")}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={user.password}
                      onChange={handleChangeInput}
                      autoComplete="current-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() => setShowPassword(prev => !prev)}
                              edge="end"
                              size="small"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <VisibilityOffIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      className={classes.submitBtn}
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        i18n.t("login.buttons.submit")
                      )}
                    </Button>
                    {allowSignup && (
                      <Grid container className={classes.signupRow}>
                        <Grid item>
                          <Link
                            href="#"
                            variant="body2"
                            component={RouterLink}
                            to="/signup"
                          >
                            {i18n.t("login.buttons.register")}
                          </Link>
                        </Grid>
                      </Grid>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
          {loginLinks.length > 0 && (
            <div className={classes.linksContainer}>
              {loginLinks.map((link, index) => (
                <a
                  className={classes.footerLink}
                  href={link.url}
                  key={`${link.url}-${index}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <Typography className={classes.versionInfo}>
        {`${gitinfo.tagName || `${gitinfo.branchName || "N/A"} ${gitinfo.commitHash || "N/A"}`}`}
        {" / "}
        {`${gitinfo.buildTimestamp || "N/A"}`}
      </Typography>
    </div>
  );
};

export default Login;
