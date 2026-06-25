import 'package:flutter/material.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const WolfyApp());
}

class WolfyApp extends StatelessWidget {
  const WolfyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Assistente Virtual Wolfy',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // Tema Material 3 limpo e moderno
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF7B5CFA), // Purple Wolfy
        scaffoldBackgroundColor: const Color(0xFFF8F9FC),
        // Fontes grandes e legíveis (Seção para TCC)
        textTheme: const TextTheme(
          titleLarge: TextStyle(fontWeight: FontWeight.bold, fontSize: 28),
          bodyLarge: TextStyle(fontSize: 18),
          bodyMedium: TextStyle(fontSize: 16),
        ),
      ),
      home: const HomePage(), // Começa direto no dashboard de intenções
    );
  }
}