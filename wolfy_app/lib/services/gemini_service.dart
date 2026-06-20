import 'dart:convert';
import 'package:http/http.dart' as http;

class GeminiService {
  // Coloque sua chave real do Google AI Studio aqui para testar no seu celular
  static const String _apiKey = "";
  static const String _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  Future<String> analisarTextoDaTela(String dadosDaTela) async {
    try {
      final url = Uri.parse("$_baseUrl?key=$_apiKey");

      // System Prompt idêntico ao que estruturamos para o letramento digital
      final String systemInstruction = 
          "Você é o Wolfy, um assistente digital focado no letramento digital e acessibilidade de idosos. "
          "Sua missão é analisar os elementos visuais de uma página web que o usuário está navegando e "
          "explicar o que é essa página, o que os principais botões fazem e se há algum risco (como anúncios falsos ou golpes). "
          "Use uma linguagem extremamente simples, acolhedora e pacífica. Se necessário, use analogias do mundo real "
          "(ex: comparar um link suspeito a uma calçada esburacada). Responda sempre em tópicos curtos e fáceis de ler.";

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "contents": [
            {
              "parts": [
                {
                  "text": "$systemInstruction\n\nAqui estão os dados extraídos da tela atual em formato JSON:\n$dadosDaTela"
                }
              ]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Tratamento da árvore do JSON de resposta do Gemini
        final String respostaIa = data['candidates'][0]['content']['parts'][0]['text'];
        return respostaIa;
      } else {
        return "Ops! O Wolfy se perdeu na conexão com o servidor. (Código de erro: ${response.statusCode})";
      }
    } catch (e) {
      return "Não consegui me conectar à inteligência na nuvem agora. Verifique sua internet. Erro: $e";
    }
  }
}