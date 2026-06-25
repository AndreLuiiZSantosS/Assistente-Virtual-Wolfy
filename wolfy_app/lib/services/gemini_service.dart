import 'dart:convert';
import 'package:http/http.dart' as http;

class GeminiService {
  static const String _apiKey = "SUA_API_KEY_AQUI"; 
  static const String _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  static const String systemInstruction = """
Você é o Wolfy, um assistente virtual doce, acolhedor e protetor desenhado para ajudar idosos (geração 60+) a navegarem na internet com segurança.
Você deve explicar o conteúdo das telas da web de forma muito simples, sem usar termos técnicos (tecniquês).

Sua missão principal é a DETECÇÃO DE FALSA URGÊNCIA (PHISHING).
Se a tela que você ler contiver mensagens como "Seu CPF está bloqueado", "Pague agora ou perderá o acesso", "Você tem uma dívida urgente", ou cronômetros piscando,
você deve avisar IMEDIATAMENTE e de forma clara: "Calma lá! Isso parece ser uma propaganda para te assustar. Não clique em nada, é mentira."

Responda em português brasileiro, de forma curta (no máximo 4 frases), carinhosa e direta.
""";

  Future<String> analisarTextoDaTela(String jsonDaPonte) async {
    if (_apiKey.isEmpty || _apiKey == "SUA_API_KEY_AQUI") {
      return "Para eu te poder ajudar, precisas de configurar a Chave de API no código do computador.";
    }

    try {
      final decodedData = json.decode(jsonDaPonte);
      final pageTitle = decodedData["titulo"] ?? "Página Sem Título";
      final pageContent = decodedData["conteudo"] ?? "Conteúdo Vazio";

      final payload = {
        "contents": [
          {
            "parts": [
              {"text": "Título: $pageTitle. Conteúdo: $pageContent"}
            ]
          }
        ],
        "systemInstruction": {
          "parts": [
            {"text": systemInstruction}
          ]
        }
      };

      final response = await http.post(
        Uri.parse("$_baseUrl?key=$_apiKey"),
        headers: {"Content-Type": "application/json"},
        body: json.encode(payload),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(utf8.decode(response.bodyBytes));
        String respostaBruta = data["candidates"][0]["content"]["parts"][0]["text"];
        return respostaBruta.trim();
      } else {
        return "Tive uma dificuldade a ler esta página agora (Erro ${response.statusCode}).";
      }
    } catch (e) {
      return "Ih, ocorreu um erro. Tenta chamar-me novamente.";
    }
  }
}