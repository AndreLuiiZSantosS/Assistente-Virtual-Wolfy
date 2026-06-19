import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:collection';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WolfyApp()); // Aqui você chama a classe que você acabou de me enviar!
}

class WolfyApp extends StatelessWidget {
  const WolfyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: WolfyBrowser(), // Essa classe WolfyBrowser também precisa existir!
    );
  }
}

class WolfyBrowser extends StatefulWidget {
  const WolfyBrowser({super.key});

  @override
  State<WolfyBrowser> createState() => _WolfyBrowserState();
}

class _WolfyBrowserState extends State<WolfyBrowser> {
  // 1. SUA CHAVE DO GEMINI
  final String geminiApiKey = ""; 

  // 2. O SEU CONTENT.JS (Injetado via Flutter)
  final String meuContentJS = """
    console.log('[Wolfy] O lobinho foi injetado pelo Flutter!');

    // Exemplo de como o JS vai chamar o Dart
    async function pedirAjudaProFlutter(dados) {
      const resposta = await window.flutter_inappwebview.callHandler('chamarIA', dados);
      console.log('[Wolfy JS] Resposta da IA:', resposta);
    }
  """;

  // 3. O CÉREBRO (Chamada da API em Dart)
  Future<String> chamarGemini(Map<String, dynamic> contexto) async {
    final url = Uri.parse(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$geminiApiKey");

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "contents": [{"parts": [{"text": "Wolfy, ajude: ${jsonEncode(contexto)}"}]}],
          "generationConfig": {"responseMimeType": "application/json"}
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['candidates'][0]['content']['parts'][0]['text'];
      }
      return '{"erro": "API Error"}';
    } catch (e) {
      return '{"erro": "$e"}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Navegador Wolfy"), backgroundColor: Colors.orange),
      body: InAppWebView(
        initialUrlRequest: URLRequest(url: WebUri("https://www.google.com")),
        initialUserScripts: UnmodifiableListView<UserScript>([
          UserScript(
            source: meuContentJS,
            injectionTime: UserScriptInjectionTime.AT_DOCUMENT_END,
          )
        ]),
        onWebViewCreated: (controller) {
          controller.addJavaScriptHandler(
            handlerName: 'chamarIA',
            callback: (args) async {
              return await chamarGemini(args[0] as Map<String, dynamic>);
            },
          );
        },
      ),
    );
  }
}