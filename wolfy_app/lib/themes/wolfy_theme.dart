import 'package:flutter/material.dart';

class WolfyTheme {
  static const primary = Color(0xFF7B5CFA);
  static const background = Color(0xFFF6F7FB);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorSchemeSeed: primary,
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}