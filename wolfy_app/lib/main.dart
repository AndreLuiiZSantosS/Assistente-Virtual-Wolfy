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
      debugShowCheckedModeBanner: false,
      title: 'Wolfy',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF6F7FB),
        fontFamily: 'Roboto',
      ),
      home: const HomePage(),
    );
  }
}