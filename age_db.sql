-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-11-2026 a las 22:14:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `age_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add Rol', 1, 'add_role'),
(2, 'Can change Rol', 1, 'change_role'),
(3, 'Can delete Rol', 1, 'delete_role'),
(4, 'Can view Rol', 1, 'view_role'),
(5, 'Can add User', 2, 'add_user'),
(6, 'Can change User', 2, 'change_user'),
(7, 'Can delete User', 2, 'delete_user'),
(8, 'Can view User', 2, 'view_user'),
(9, 'Can add User Role', 3, 'add_userrole'),
(10, 'Can change User Role', 3, 'change_userrole'),
(11, 'Can delete User Role', 3, 'delete_userrole'),
(12, 'Can view User Role', 3, 'view_userrole'),
(13, 'Can add log entry', 4, 'add_logentry'),
(14, 'Can change log entry', 4, 'change_logentry'),
(15, 'Can delete log entry', 4, 'delete_logentry'),
(16, 'Can view log entry', 4, 'view_logentry'),
(17, 'Can add permission', 5, 'add_permission'),
(18, 'Can change permission', 5, 'change_permission'),
(19, 'Can delete permission', 5, 'delete_permission'),
(20, 'Can view permission', 5, 'view_permission'),
(21, 'Can add group', 6, 'add_group'),
(22, 'Can change group', 6, 'change_group'),
(23, 'Can delete group', 6, 'delete_group'),
(24, 'Can view group', 6, 'view_group'),
(25, 'Can add content type', 7, 'add_contenttype'),
(26, 'Can change content type', 7, 'change_contenttype'),
(27, 'Can delete content type', 7, 'delete_contenttype'),
(28, 'Can view content type', 7, 'view_contenttype'),
(29, 'Can add session', 8, 'add_session'),
(30, 'Can change session', 8, 'change_session'),
(31, 'Can delete session', 8, 'delete_session'),
(32, 'Can view session', 8, 'view_session'),
(33, 'Can add company profile', 9, 'add_companyprofile'),
(34, 'Can change company profile', 9, 'change_companyprofile'),
(35, 'Can delete company profile', 9, 'delete_companyprofile'),
(36, 'Can view company profile', 9, 'view_companyprofile'),
(37, 'Can add invoice', 10, 'add_invoice'),
(38, 'Can change invoice', 10, 'change_invoice'),
(39, 'Can delete invoice', 10, 'delete_invoice'),
(40, 'Can view invoice', 10, 'view_invoice'),
(41, 'Can add invoice item', 11, 'add_invoiceitem'),
(42, 'Can change invoice item', 11, 'change_invoiceitem'),
(43, 'Can delete invoice item', 11, 'delete_invoiceitem'),
(44, 'Can view invoice item', 11, 'view_invoiceitem');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `company_profile`
--

CREATE TABLE `company_profile` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `rnc` varchar(20) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `correo` varchar(254) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `actualizado` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `company_profile`
--

INSERT INTO `company_profile` (`id`, `nombre`, `rnc`, `telefono`, `correo`, `direccion`, `actualizado`) VALUES
(1, 'ASEO', '40239576586', '+18294308085', 'nathanmerk200@gmail.com', 'Calle Principal Reparto Peralta', '2026-11-10 20:23:32.593826');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(9, 'A_G_E', 'companyprofile'),
(10, 'A_G_E', 'invoice'),
(11, 'A_G_E', 'invoiceitem'),
(4, 'admin', 'logentry'),
(6, 'auth', 'group'),
(5, 'auth', 'permission'),
(7, 'contenttypes', 'contenttype'),
(8, 'sessions', 'session'),
(1, 'users', 'role'),
(2, 'users', 'user'),
(3, 'users', 'userrole');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2026-11-10 20:07:04.627168'),
(2, 'contenttypes', '0002_remove_content_type_name', '2026-11-10 20:07:04.683062'),
(3, 'auth', '0001_initial', '2026-11-10 20:07:04.888706'),
(4, 'auth', '0002_alter_permission_name_max_length', '2026-11-10 20:07:04.931814'),
(5, 'auth', '0003_alter_user_email_max_length', '2026-11-10 20:07:04.935771'),
(6, 'auth', '0004_alter_user_username_opts', '2026-11-10 20:07:04.939837'),
(7, 'auth', '0005_alter_user_last_login_null', '2026-11-10 20:07:04.945007'),
(8, 'auth', '0006_require_contenttypes_0002', '2026-11-10 20:07:04.947032'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2026-11-10 20:07:04.951192'),
(10, 'auth', '0008_alter_user_username_max_length', '2026-11-10 20:07:04.956149'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2026-11-10 20:07:04.960929'),
(12, 'auth', '0010_alter_group_name_max_length', '2026-11-10 20:07:04.970106'),
(13, 'auth', '0011_update_proxy_permissions', '2026-11-10 20:07:04.975013'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2026-11-10 20:07:04.979023'),
(15, 'users', '0001_initial', '2026-11-10 20:07:05.289798'),
(16, 'admin', '0001_initial', '2026-11-10 20:07:05.376057'),
(17, 'admin', '0002_logentry_remove_auto_add', '2026-11-10 20:07:05.382065'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2026-11-10 20:07:05.388557'),
(19, 'sessions', '0001_initial', '2026-11-10 20:07:05.415456'),
(20, 'users', '0002_alter_user_password', '2026-11-10 20:07:05.427065'),
(21, 'A_G_E', '0001_initial', '2026-11-10 20:17:54.767517');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('snr2q05l8vg4pxjlf0nbuo3aca9voza7', '.eJxVjMsOwiAQAP9lz4bwWCj06N1vILBspWpoUtqT8d9Nkx70OjOZN8S0bzXundc4FxhBweWX5URPbocoj9Tui6ClbeucxZGI03ZxWwq_rmf7N6ipVxiBLMrBIiOpgkYG7xINbL13lo2UmRUjofa-WKZJm6ADkgo6KKNc1hN8vsMPNus:1xQsmt:dCtcNJf6rmCTHdWvB-IKIMWp4_a9fD01SY3kpfo0Shg', '2026-11-24 20:49:51.980082');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) NOT NULL,
  `empresa_nombre` varchar(150) NOT NULL,
  `empresa_rnc` varchar(20) NOT NULL,
  `empresa_direccion` varchar(255) NOT NULL,
  `empresa_correo` varchar(254) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `cliente` varchar(150) NOT NULL,
  `rnc` varchar(20) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `correo` varchar(254) NOT NULL,
  `comprobante_fiscal` varchar(30) NOT NULL,
  `metodo_pago` varchar(30) NOT NULL,
  `estado` varchar(12) NOT NULL,
  `tasa_impuesto` decimal(4,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `impuesto` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `fecha` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `invoices`
--

INSERT INTO `invoices` (`id`, `empresa_nombre`, `empresa_rnc`, `empresa_direccion`, `empresa_correo`, `tipo`, `cliente`, `rnc`, `direccion`, `correo`, `comprobante_fiscal`, `metodo_pago`, `estado`, `tasa_impuesto`, `subtotal`, `impuesto`, `total`, `fecha`) VALUES
(1, 'ASEO', '40239576586', 'Calle Principal Reparto Peralta', 'nathanmerk200@gmail.com', 'normal', 'PACO', '', 'su casa', 'cliente@paco.com', '40239576586', 'efectivo', 'Pagada', 18.00, 150.00, 27.00, 177.00, '2026-11-10 20:36:07.755480'),
(2, 'ASEO', '40239576586', 'Calle Principal Reparto Peralta', 'nathanmerk200@gmail.com', 'normal', 'PAQUITO', '', 'SU CASA1', 'cliente@paco.com', '40239576586', 'tarjeta', 'Pagada', 18.00, 960.00, 172.80, 1132.80, '2026-11-10 20:45:07.111060');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint(20) NOT NULL,
  `producto` varchar(150) NOT NULL,
  `cantidad` int(10) UNSIGNED NOT NULL CHECK (`cantidad` >= 0),
  `precio_unitario` decimal(12,2) NOT NULL,
  `importe` decimal(12,2) NOT NULL,
  `factura_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `producto`, `cantidad`, `precio_unitario`, `importe`, `factura_id`) VALUES
(1, 'PANE', 15, 10.00, 150.00, 1),
(2, 'CAFE', 2, 480.00, 960.00, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `rol_nombre` varchar(50) NOT NULL,
  `clientes` int(11) NOT NULL,
  `facturacion` int(11) NOT NULL,
  `empleados` int(11) NOT NULL,
  `inventario` int(11) NOT NULL,
  `produccion` int(11) NOT NULL,
  `estadisticas` int(11) NOT NULL,
  `impuestos` int(11) NOT NULL,
  `empresa` int(11) NOT NULL,
  `usuarios` int(11) NOT NULL,
  `respaldos` int(11) NOT NULL,
  `seguridad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(150) NOT NULL,
  `password` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`last_login`, `is_superuser`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `user_id`, `username`, `password`) VALUES
('2026-11-10 20:49:51.977746', 0, '', '', 'nathanmerk200@gmail.com', 0, 1, '2026-11-10 20:49:49.900696', 1, 'TATAN', 'pbkdf2_sha256$600000$8RXVCtU7nx3v2uydHX0EO1$pyGVyY3VRSEL21WcM7zl0W7+NFFabnQ9MA9iHEGrh1A='),
(NULL, 1, '', '', 'ageproyect@gmail.com', 1, 1, '2026-11-10 21:14:13.881041', 2, 'admin', 'pbkdf2_sha256$600000$R123GFgIEwmEome7IsBev4$T/yJHt7cSu0X+huW6KCnXXyTzSThjDtGkOhODdoGOLY=');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users_groups`
--

CREATE TABLE `users_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users_user_permissions`
--

CREATE TABLE `users_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `id` bigint(20) NOT NULL,
  `role_id` varchar(50) NOT NULL,
  `user_id_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `company_profile`
--
ALTER TABLE `company_profile`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_factura_id_e5f39a9f_fk_invoices_id` (`factura_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`rol_nombre`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `users_groups`
--
ALTER TABLE `users_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_groups_user_id_group_id_fc7788e8_uniq` (`user_id`,`group_id`),
  ADD KEY `users_groups_group_id_2f3517aa_fk_auth_group_id` (`group_id`);

--
-- Indices de la tabla `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_permissions_user_id_permission_id_3b86cbdf_uniq` (`user_id`,`permission_id`),
  ADD KEY `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_user_id_id_role_id_7daee607_uniq` (`user_id_id`,`role_id`),
  ADD KEY `user_roles_role_id_816a4486_fk_roles_rol_nombre` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `company_profile`
--
ALTER TABLE `company_profile`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users_groups`
--
ALTER TABLE `users_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Filtros para la tabla `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_factura_id_e5f39a9f_fk_invoices_id` FOREIGN KEY (`factura_id`) REFERENCES `invoices` (`id`);

--
-- Filtros para la tabla `users_groups`
--
ALTER TABLE `users_groups`
  ADD CONSTRAINT `users_groups_group_id_2f3517aa_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `users_groups_user_id_f500bee5_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Filtros para la tabla `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  ADD CONSTRAINT `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `users_user_permissions_user_id_92473840_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_role_id_816a4486_fk_roles_rol_nombre` FOREIGN KEY (`role_id`) REFERENCES `roles` (`rol_nombre`),
  ADD CONSTRAINT `user_roles_user_id_id_3731845e_fk_users_user_id` FOREIGN KEY (`user_id_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
