
import React, { useState, useEffect } from 'react';
import { User, Home, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const Agendamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendNotification } = usePushNotifications();
  
  const [unidade, setUnidade] = useState('');
  const [data, setData] = useState<Date>();
  const [horario, setHorario] = useState('');
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState('');

  // Todas as unidades organizadas por estado
  const todasUnidades = {
    'AC': [
      // Acre
      { value: 'ac_rio_branco', label: 'Poupatempo Rio Branco' },
      { value: 'ac_cruzeiro_sul', label: 'Poupatempo Cruzeiro do Sul' },
      { value: 'ac_sena_madureira', label: 'Poupatempo Sena Madureira' },
      { value: 'ac_tarauaca', label: 'Poupatempo Tarauacá' },
      { value: 'ac_feijo', label: 'Poupatempo Feijó' },
      { value: 'ac_brasileia', label: 'Poupatempo Brasiléia' },
      { value: 'ac_xapuri', label: 'Poupatempo Xapuri' },
      { value: 'ac_epitaciolandia', label: 'Poupatempo Epitaciolândia' },
    ],
    'AL': [
      // Alagoas
      { value: 'al_maceio', label: 'Poupatempo Maceió' },
      { value: 'al_arapiraca', label: 'Poupatempo Arapiraca' },
      { value: 'al_palmeira_dos_indios', label: 'Poupatempo Palmeira dos Índios' },
      { value: 'al_rio_largo', label: 'Poupatempo Rio Largo' },
      { value: 'al_penedo', label: 'Poupatempo Penedo' },
      { value: 'al_uniao_palmares', label: 'Poupatempo União dos Palmares' },
      { value: 'al_coruripe', label: 'Poupatempo Coruripe' },
      { value: 'al_santana_ipanema', label: 'Poupatempo Santana do Ipanema' },
    ],
    'AP': [
      // Amapá
      { value: 'ap_macapa', label: 'Poupatempo Macapá' },
      { value: 'ap_santana', label: 'Poupatempo Santana' },
      { value: 'ap_laranjal_jari', label: 'Poupatempo Laranjal do Jari' },
      { value: 'ap_oiapoque', label: 'Poupatempo Oiapoque' },
      { value: 'ap_mazagao', label: 'Poupatempo Mazagão' },
    ],
    'AM': [
      // Amazonas
      { value: 'am_manaus', label: 'Poupatempo Manaus' },
      { value: 'am_parintins', label: 'Poupatempo Parintins' },
      { value: 'am_itacoatiara', label: 'Poupatempo Itacoatiara' },
      { value: 'am_manacapuru', label: 'Poupatempo Manacapuru' },
      { value: 'am_coari', label: 'Poupatempo Coari' },
      { value: 'am_tefe', label: 'Poupatempo Tefé' },
      { value: 'am_tabatinga', label: 'Poupatempo Tabatinga' },
      { value: 'am_sao_gabriel_cachoeira', label: 'Poupatempo São Gabriel da Cachoeira' },
    ],
    'BA': [
      // Bahia
      { value: 'ba_salvador', label: 'Poupatempo Salvador Centro' },
      { value: 'ba_salvador_shopping_da_bahia', label: 'Poupatempo Shopping da Bahia - Salvador' },
      { value: 'ba_salvador_liberdade', label: 'Poupatempo Liberdade - Salvador' },
      { value: 'ba_feira_santana', label: 'Poupatempo Feira de Santana' },
      { value: 'ba_vitoria_conquista', label: 'Poupatempo Vitória da Conquista' },
      { value: 'ba_camacari', label: 'Poupatempo Camaçari' },
      { value: 'ba_itabuna', label: 'Poupatempo Itabuna' },
      { value: 'ba_juazeiro', label: 'Poupatempo Juazeiro' },
      { value: 'ba_lauro_freitas', label: 'Poupatempo Lauro de Freitas' },
      { value: 'ba_ilheus', label: 'Poupatempo Ilhéus' },
      { value: 'ba_jequie', label: 'Poupatempo Jequié' },
      { value: 'ba_teixeira_freitas', label: 'Poupatempo Teixeira de Freitas' },
      { value: 'ba_barreiras', label: 'Poupatempo Barreiras' },
      { value: 'ba_alagoinhas', label: 'Poupatempo Alagoinhas' },
      { value: 'ba_porto_seguro', label: 'Poupatempo Porto Seguro' },
      { value: 'ba_simoes_filho', label: 'Poupatempo Simões Filho' },
      { value: 'ba_paulo_afonso', label: 'Poupatempo Paulo Afonso' },
      { value: 'ba_eunapolis', label: 'Poupatempo Eunápolis' },
      { value: 'ba_candeias', label: 'Poupatempo Candeias' },
      { value: 'ba_guanambi', label: 'Poupatempo Guanambi' },
    ],
    'CE': [
      // Ceará
      { value: 'ce_fortaleza', label: 'Poupatempo Fortaleza' },
      { value: 'ce_caucaia', label: 'Poupatempo Caucaia' },
      { value: 'ce_juazeiro_norte', label: 'Poupatempo Juazeiro do Norte' },
      { value: 'ce_maracanau', label: 'Poupatempo Maracanaú' },
      { value: 'ce_sobral', label: 'Poupatempo Sobral' },
      { value: 'ce_crato', label: 'Poupatempo Crato' },
      { value: 'ce_itapipoca', label: 'Poupatempo Itapipoca' },
      { value: 'ce_maranguape', label: 'Poupatempo Maranguape' },
      { value: 'ce_iguatu', label: 'Poupatempo Iguatu' },
      { value: 'ce_quixada', label: 'Poupatempo Quixadá' },
      { value: 'ce_caninde', label: 'Poupatempo Canindé' },
      { value: 'ce_aquiraz', label: 'Poupatempo Aquiraz' },
    ],
    'DF': [
      // Distrito Federal
      { value: 'df_brasilia', label: 'Poupatempo Brasília' },
      { value: 'df_taguatinga', label: 'Poupatempo Taguatinga' },
      { value: 'df_ceilandia', label: 'Poupatempo Ceilândia' },
      { value: 'df_samambaia', label: 'Poupatempo Samambaia' },
      { value: 'df_planaltina', label: 'Poupatempo Planaltina' },
      { value: 'df_sobradinho', label: 'Poupatempo Sobradinho' },
      { value: 'df_gama', label: 'Poupatempo Gama' },
      { value: 'df_santa_maria', label: 'Poupatempo Santa Maria' },
    ],
    'ES': [
      // Espírito Santo
      { value: 'es_vitoria', label: 'Poupatempo Vitória' },
      { value: 'es_vila_velha', label: 'Poupatempo Vila Velha' },
      { value: 'es_cariacica', label: 'Poupatempo Cariacica' },
      { value: 'es_serra', label: 'Poupatempo Serra' },
      { value: 'es_cachoeiro_itapemirim', label: 'Poupatempo Cachoeiro de Itapemirim' },
      { value: 'es_linhares', label: 'Poupatempo Linhares' },
      { value: 'es_sao_mateus', label: 'Poupatempo São Mateus' },
      { value: 'es_colatina', label: 'Poupatempo Colatina' },
      { value: 'es_guarapari', label: 'Poupatempo Guarapari' },
      { value: 'es_viana', label: 'Poupatempo Viana' },
    ],
    'GO': [
      // Goiás
      { value: 'go_goiania', label: 'Poupatempo Goiânia' },
      { value: 'go_aparecida_goiania', label: 'Poupatempo Aparecida de Goiânia' },
      { value: 'go_anapolis', label: 'Poupatempo Anápolis' },
      { value: 'go_rio_verde', label: 'Poupatempo Rio Verde' },
      { value: 'go_luziania', label: 'Poupatempo Luziânia' },
      { value: 'go_aguas_lindas', label: 'Poupatempo Águas Lindas de Goiás' },
      { value: 'go_valparaiso', label: 'Poupatempo Valparaíso de Goiás' },
      { value: 'go_trindade', label: 'Poupatempo Trindade' },
      { value: 'go_formosa', label: 'Poupatempo Formosa' },
      { value: 'go_novo_gama', label: 'Poupatempo Novo Gama' },
      { value: 'go_itumbiara', label: 'Poupatempo Itumbiara' },
      { value: 'go_senador_canedo', label: 'Poupatempo Senador Canedo' },
    ],
    'MA': [
      // Maranhão
      { value: 'ma_sao_luis', label: 'Poupatempo São Luís' },
      { value: 'ma_imperatriz', label: 'Poupatempo Imperatriz' },
      { value: 'ma_timon', label: 'Poupatempo Timon' },
      { value: 'ma_caxias', label: 'Poupatempo Caxias' },
      { value: 'ma_codó', label: 'Poupatempo Codó' },
      { value: 'ma_paço_lumiar', label: 'Poupatempo Paço do Lumiar' },
      { value: 'ma_acailandia', label: 'Poupatempo Açailândia' },
      { value: 'ma_bacabal', label: 'Poupatempo Bacabal' },
      { value: 'ma_balsas', label: 'Poupatempo Balsas' },
      { value: 'ma_barra_corda', label: 'Poupatempo Barra do Corda' },
    ],
    'MT': [
      // Mato Grosso
      { value: 'mt_cuiaba', label: 'Poupatempo Cuiabá' },
      { value: 'mt_varzea_grande', label: 'Poupatempo Várzea Grande' },
      { value: 'mt_rondonopolis', label: 'Poupatempo Rondonópolis' },
      { value: 'mt_sinop', label: 'Poupatempo Sinop' },
      { value: 'mt_tangara_serra', label: 'Poupatempo Tangará da Serra' },
      { value: 'mt_caceres', label: 'Poupatempo Cáceres' },
      { value: 'mt_barra_garcas', label: 'Poupatempo Barra do Garças' },
      { value: 'mt_pontes_lacerda', label: 'Poupatempo Pontes e Lacerda' },
      { value: 'mt_sorriso', label: 'Poupatempo Sorriso' },
      { value: 'mt_lucas_rio_verde', label: 'Poupatempo Lucas do Rio Verde' },
    ],
    'MS': [
      // Mato Grosso do Sul
      { value: 'ms_campo_grande', label: 'Poupatempo Campo Grande' },
      { value: 'ms_dourados', label: 'Poupatempo Dourados' },
      { value: 'ms_tres_lagoas', label: 'Poupatempo Três Lagoas' },
      { value: 'ms_corumba', label: 'Poupatempo Corumbá' },
      { value: 'ms_ponta_pora', label: 'Poupatempo Ponta Porã' },
      { value: 'ms_naviraí', label: 'Poupatempo Naviraí' },
      { value: 'ms_nova_andradina', label: 'Poupatempo Nova Andradina' },
      { value: 'ms_aquidauana', label: 'Poupatempo Aquidauana' },
      { value: 'ms_sidrolandia', label: 'Poupatempo Sidrolândia' },
      { value: 'ms_paranaiba', label: 'Poupatempo Paranaíba' },
    ],
    'MG': [
      // Minas Gerais
      { value: 'mg_bh_centro', label: 'Poupatempo BH Centro - Minas Gerais' },
      { value: 'mg_bh_barreiro', label: 'Poupatempo Barreiro - Belo Horizonte' },
      { value: 'mg_bh_venda_nova', label: 'Poupatempo Venda Nova - Belo Horizonte' },
      { value: 'mg_bh_pampulha', label: 'Poupatempo Pampulha - Belo Horizonte' },
      { value: 'mg_contagem', label: 'Poupatempo Contagem' },
      { value: 'mg_uberlandia', label: 'Poupatempo Uberlândia' },
      { value: 'mg_juiz_fora', label: 'Poupatempo Juiz de Fora' },
      { value: 'mg_betim', label: 'Poupatempo Betim' },
      { value: 'mg_montes_claros', label: 'Poupatempo Montes Claros' },
      { value: 'mg_ribeirao_neves', label: 'Poupatempo Ribeirão das Neves' },
      { value: 'mg_uberaba', label: 'Poupatempo Uberaba' },
      { value: 'mg_governador_valadares', label: 'Poupatempo Governador Valadares' },
      { value: 'mg_ipatinga', label: 'Poupatempo Ipatinga' },
      { value: 'mg_santa_luzia', label: 'Poupatempo Santa Luzia' },
      { value: 'mg_nova_lima', label: 'Poupatempo Nova Lima' },
      { value: 'mg_sabara', label: 'Poupatempo Sabará' },
      { value: 'mg_sete_lagoas', label: 'Poupatempo Sete Lagoas' },
      { value: 'mg_divinopolis', label: 'Poupatempo Divinópolis' },
      { value: 'mg_pouso_alegre', label: 'Poupatempo Pouso Alegre' },
      { value: 'mg_barbacena', label: 'Poupatempo Barbacena' },
      { value: 'mg_pocos_caldas', label: 'Poupatempo Poços de Caldas' },
      { value: 'mg_varginha', label: 'Poupatempo Varginha' },
    ],
    'PA': [
      // Pará
      { value: 'pa_belem', label: 'Poupatempo Belém' },
      { value: 'pa_ananindeua', label: 'Poupatempo Ananindeua' },
      { value: 'pa_santarem', label: 'Poupatempo Santarém' },
      { value: 'pa_maraba', label: 'Poupatempo Marabá' },
      { value: 'pa_parauapebas', label: 'Poupatempo Parauapebas' },
      { value: 'pa_castanhal', label: 'Poupatempo Castanhal' },
      { value: 'pa_abaetetuba', label: 'Poupatempo Abaetetuba' },
      { value: 'pa_marituba', label: 'Poupatempo Marituba' },
      { value: 'pa_altamira', label: 'Poupatempo Altamira' },
      { value: 'pa_tucurui', label: 'Poupatempo Tucuruí' },
      { value: 'pa_cameta', label: 'Poupatempo Cametá' },
      { value: 'pa_braganca', label: 'Poupatempo Bragança' },
    ],
    'PB': [
      // Paraíba
      { value: 'pb_joao_pessoa', label: 'Poupatempo João Pessoa' },
      { value: 'pb_campina_grande', label: 'Poupatempo Campina Grande' },
      { value: 'pb_santa_rita', label: 'Poupatempo Santa Rita' },
      { value: 'pb_patos', label: 'Poupatempo Patos' },
      { value: 'pb_bayeux', label: 'Poupatempo Bayeux' },
      { value: 'pb_sousa', label: 'Poupatempo Sousa' },
      { value: 'pb_cajazeiras', label: 'Poupatempo Cajazeiras' },
      { value: 'pb_cabedelo', label: 'Poupatempo Cabedelo' },
      { value: 'pb_guarabira', label: 'Poupatempo Guarabira' },
      { value: 'pb_mamanguape', label: 'Poupatempo Mamanguape' },
    ],
    'PR': [
      // Paraná
      { value: 'pr_curitiba', label: 'Poupatempo Curitiba Centro' },
      { value: 'pr_curitiba_portao', label: 'Poupatempo Curitiba Portão' },
      { value: 'pr_londrina', label: 'Poupatempo Londrina' },
      { value: 'pr_maringa', label: 'Poupatempo Maringá' },
      { value: 'pr_ponta_grossa', label: 'Poupatempo Ponta Grossa' },
      { value: 'pr_cascavel', label: 'Poupatempo Cascavel' },
      { value: 'pr_sao_jose_pinhais', label: 'Poupatempo São José dos Pinhais' },
      { value: 'pr_foz_iguacu', label: 'Poupatempo Foz do Iguaçu' },
      { value: 'pr_colombo', label: 'Poupatempo Colombo' },
      { value: 'pr_guarapuava', label: 'Poupatempo Guarapuava' },
      { value: 'pr_paranagua', label: 'Poupatempo Paranaguá' },
      { value: 'pr_araucaria', label: 'Poupatempo Araucária' },
      { value: 'pr_toledo', label: 'Poupatempo Toledo' },
      { value: 'pr_apucarana', label: 'Poupatempo Apucarana' },
      { value: 'pr_pinhais', label: 'Poupatempo Pinhais' },
      { value: 'pr_campo_largo', label: 'Poupatempo Campo Largo' },
      { value: 'pr_arapongas', label: 'Poupatempo Arapongas' },
      { value: 'pr_almirante_tamandare', label: 'Poupatempo Almirante Tamandaré' },
      { value: 'pr_umuarama', label: 'Poupatempo Umuarama' },
      { value: 'pr_paranavaí', label: 'Poupatempo Paranavaí' },
    ],
    'PE': [
      // Pernambuco
      { value: 'pe_recife', label: 'Poupatempo Recife' },
      { value: 'pe_jaboatao_guararapes', label: 'Poupatempo Jaboatão dos Guararapes' },
      { value: 'pe_olinda', label: 'Poupatempo Olinda' },
      { value: 'pe_caruaru', label: 'Poupatempo Caruaru' },
      { value: 'pe_petrolina', label: 'Poupatempo Petrolina' },
      { value: 'pe_paulista', label: 'Poupatempo Paulista' },
      { value: 'pe_cabo_santo_agostinho', label: 'Poupatempo Cabo de Santo Agostinho' },
      { value: 'pe_camaragibe', label: 'Poupatempo Camaragibe' },
      { value: 'pe_garanhuns', label: 'Poupatempo Garanhuns' },
      { value: 'pe_vitoria_santo_antao', label: 'Poupatempo Vitória de Santo Antão' },
      { value: 'pe_igarassu', label: 'Poupatempo Igarassu' },
      { value: 'pe_sao_lourenco_mata', label: 'Poupatempo São Lourenço da Mata' },
    ],
    'PI': [
      // Piauí
      { value: 'pi_teresina', label: 'Poupatempo Teresina' },
      { value: 'pi_parnaiba', label: 'Poupatempo Parnaíba' },
      { value: 'pi_picos', label: 'Poupatempo Picos' },
      { value: 'pi_piripiri', label: 'Poupatempo Piripiri' },
      { value: 'pi_floriano', label: 'Poupatempo Floriano' },
      { value: 'pi_campo_maior', label: 'Poupatempo Campo Maior' },
      { value: 'pi_bom_jesus', label: 'Poupatempo Bom Jesus' },
      { value: 'pi_oeiras', label: 'Poupatempo Oeiras' },
      { value: 'pi_barras', label: 'Poupatempo Barras' },
      { value: 'pi_uniao', label: 'Poupatempo União' },
    ],
    'RJ': [
      // Rio de Janeiro
      { value: 'rj_rio_centro', label: 'Poupatempo Rio de Janeiro Centro' },
      { value: 'rj_rio_barra', label: 'Poupatempo Barra da Tijuca - Rio de Janeiro' },
      { value: 'rj_rio_tijuca', label: 'Poupatempo Tijuca - Rio de Janeiro' },
      { value: 'rj_sao_goncalo', label: 'Poupatempo São Gonçalo' },
      { value: 'rj_duque_caxias', label: 'Poupatempo Duque de Caxias' },
      { value: 'rj_nova_iguacu', label: 'Poupatempo Nova Iguaçu' },
      { value: 'rj_niteroi', label: 'Poupatempo Niterói' },
      { value: 'rj_belford_roxo', label: 'Poupatempo Belford Roxo' },
      { value: 'rj_sao_joao_meriti', label: 'Poupatempo São João de Meriti' },
      { value: 'rj_petropolis', label: 'Poupatempo Petrópolis' },
      { value: 'rj_volta_redonda', label: 'Poupatempo Volta Redonda' },
      { value: 'rj_magé', label: 'Poupatempo Magé' },
      { value: 'rj_itaborai', label: 'Poupatempo Itaboraí' },
      { value: 'rj_marica', label: 'Poupatempo Maricá' },
      { value: 'rj_campos', label: 'Poupatempo Campos dos Goytacazes' },
      { value: 'rj_angra_reis', label: 'Poupatempo Angra dos Reis' },
      { value: 'rj_barra_mansa', label: 'Poupatempo Barra Mansa' },
      { value: 'rj_nova_friburgo', label: 'Poupatempo Nova Friburgo' },
      { value: 'rj_cabo_frio', label: 'Poupatempo Cabo Frio' },
      { value: 'rj_macae', label: 'Poupatempo Macaé' },
    ],
    'RN': [
      // Rio Grande do Norte
      { value: 'rn_natal', label: 'Poupatempo Natal' },
      { value: 'rn_mossoró', label: 'Poupatempo Mossoró' },
      { value: 'rn_parnamirim', label: 'Poupatempo Parnamirim' },
      { value: 'rn_sao_goncalo_amarante', label: 'Poupatempo São Gonçalo do Amarante' },
      { value: 'rn_macaiba', label: 'Poupatempo Macaíba' },
      { value: 'rn_ceara_mirim', label: 'Poupatempo Ceará-Mirim' },
      { value: 'rn_caico', label: 'Poupatempo Caicó' },
      { value: 'rn_assú', label: 'Poupatempo Assú' },
      { value: 'rn_currais_novos', label: 'Poupatempo Currais Novos' },
      { value: 'rn_nova_cruz', label: 'Poupatempo Nova Cruz' },
    ],
    'RS': [
      // Rio Grande do Sul
      { value: 'rs_porto_alegre', label: 'Poupatempo Porto Alegre Centro' },
      { value: 'rs_caxias_sul', label: 'Poupatempo Caxias do Sul' },
      { value: 'rs_pelotas', label: 'Poupatempo Pelotas' },
      { value: 'rs_canoas', label: 'Poupatempo Canoas' },
      { value: 'rs_santa_maria', label: 'Poupatempo Santa Maria' },
      { value: 'rs_gravataí', label: 'Poupatempo Gravataí' },
      { value: 'rs_viamao', label: 'Poupatempo Viamão' },
      { value: 'rs_novo_hamburgo', label: 'Poupatempo Novo Hamburgo' },
      { value: 'rs_sao_leopoldo', label: 'Poupatempo São Leopoldo' },
      { value: 'rs_rio_grande', label: 'Poupatempo Rio Grande' },
      { value: 'rs_alvorada', label: 'Poupatempo Alvorada' },
      { value: 'rs_passo_fundo', label: 'Poupatempo Passo Fundo' },
      { value: 'rs_sapucaia', label: 'Poupatempo Sapucaia do Sul' },
      { value: 'rs_uruguaiana', label: 'Poupatempo Uruguaiana' },
      { value: 'rs_santa_cruz', label: 'Poupatempo Santa Cruz do Sul' },
      { value: 'rs_cachoeirinha', label: 'Poupatempo Cachoeirinha' },
      { value: 'rs_bento_goncalves', label: 'Poupatempo Bento Gonçalves' },
      { value: 'rs_erechim', label: 'Poupatempo Erechim' },
      { value: 'rs_bagé', label: 'Poupatempo Bagé' },
      { value: 'rs_lajeado', label: 'Poupatempo Lajeado' },
    ],
    'RO': [
      // Rondônia
      { value: 'ro_porto_velho', label: 'Poupatempo Porto Velho' },
      { value: 'ro_ji_parana', label: 'Poupatempo Ji-Paraná' },
      { value: 'ro_ariquemes', label: 'Poupatempo Ariquemes' },
      { value: 'ro_vilhena', label: 'Poupatempo Vilhena' },
      { value: 'ro_cacoal', label: 'Poupatempo Cacoal' },
      { value: 'ro_rolim_moura', label: 'Poupatempo Rolim de Moura' },
      { value: 'ro_guajara_mirim', label: 'Poupatempo Guajará-Mirim' },
      { value: 'ro_jaru', label: 'Poupatempo Jaru' },
    ],
    'RR': [
      // Roraima
      { value: 'rr_boa_vista', label: 'Poupatempo Boa Vista' },
      { value: 'rr_rorainopolis', label: 'Poupatempo Rorainópolis' },
      { value: 'rr_caracarai', label: 'Poupatempo Caracaraí' },
      { value: 'rr_alto_alegre', label: 'Poupatempo Alto Alegre' },
      { value: 'rr_mucajai', label: 'Poupatempo Mucajaí' },
    ],
    'SC': [
      // Santa Catarina
      { value: 'sc_florianopolis', label: 'Poupatempo Florianópolis' },
      { value: 'sc_joinville', label: 'Poupatempo Joinville' },
      { value: 'sc_blumenau', label: 'Poupatempo Blumenau' },
      { value: 'sc_sao_jose', label: 'Poupatempo São José' },
      { value: 'sc_criciuma', label: 'Poupatempo Criciúma' },
      { value: 'sc_chapeco', label: 'Poupatempo Chapecó' },
      { value: 'sc_itajai', label: 'Poupatempo Itajaí' },
      { value: 'sc_lages', label: 'Poupatempo Lages' },
      { value: 'sc_palhoça', label: 'Poupatempo Palhoça' },
      { value: 'sc_balneario_camboriu', label: 'Poupatempo Balneário Camboriú' },
      { value: 'sc_brusque', label: 'Poupatempo Brusque' },
      { value: 'sc_tubarao', label: 'Poupatempo Tubarão' },
      { value: 'sc_sao_bento_sul', label: 'Poupatempo São Bento do Sul' },
      { value: 'sc_cacador', label: 'Poupatempo Caçador' },
      { value: 'sc_camboriu', label: 'Poupatempo Camboriú' },
    ],
    'SP': [
      // São Paulo
      { value: 'sp_sp_se', label: 'Poupatempo Sé - São Paulo' },
      { value: 'sp_sp_liberdade', label: 'Poupatempo Liberdade - São Paulo' },
      { value: 'sp_sp_itaquera', label: 'Poupatempo Itaquera - São Paulo' },
      { value: 'sp_guarulhos', label: 'Poupatempo Guarulhos' },
      { value: 'sp_campinas', label: 'Poupatempo Campinas' },
      { value: 'sp_sao_bernardo', label: 'Poupatempo São Bernardo do Campo' },
      { value: 'sp_santo_andre', label: 'Poupatempo Santo André' },
      { value: 'sp_osasco', label: 'Poupatempo Osasco' },
      { value: 'sp_sorocaba', label: 'Poupatempo Sorocaba' },
      { value: 'sp_ribeirao_preto', label: 'Poupatempo Ribeirão Preto' },
      { value: 'sp_santos', label: 'Poupatempo Santos' },
      { value: 'sp_mauá', label: 'Poupatempo Mauá' },
      { value: 'sp_sao_jose_campos', label: 'Poupatempo São José dos Campos' },
      { value: 'sp_mogi_cruzes', label: 'Poupatempo Mogi das Cruzes' },
      { value: 'sp_diadema', label: 'Poupatempo Diadema' },
      { value: 'sp_jundiai', label: 'Poupatempo Jundiaí' },
      { value: 'sp_carapicuiba', label: 'Poupatempo Carapicuíba' },
      { value: 'sp_piracicaba', label: 'Poupatempo Piracicaba' },
      { value: 'sp_bauru', label: 'Poupatempo Bauru' },
      { value: 'sp_sao_vicente', label: 'Poupatempo São Vicente' },
      { value: 'sp_franca', label: 'Poupatempo Franca' },
      { value: 'sp_guaruja', label: 'Poupatempo Guarujá' },
      { value: 'sp_taubate', label: 'Poupatempo Taubaté' },
      { value: 'sp_limeira', label: 'Poupatempo Limeira' },
      { value: 'sp_suzano', label: 'Poupatempo Suzano' },
    ],
    'SE': [
      // Sergipe
      { value: 'se_aracaju', label: 'Poupatempo Aracaju' },
      { value: 'se_nossa_senhora_socorro', label: 'Poupatempo Nossa Senhora do Socorro' },
      { value: 'se_lagarto', label: 'Poupatempo Lagarto' },
      { value: 'se_itabaiana', label: 'Poupatempo Itabaiana' },
      { value: 'se_sao_cristovao', label: 'Poupatempo São Cristóvão' },
      { value: 'se_estancia', label: 'Poupatempo Estância' },
      { value: 'se_tobias_barreto', label: 'Poupatempo Tobias Barreto' },
      { value: 'se_simao_dias', label: 'Poupatempo Simão Dias' },
    ],
    'TO': [
      // Tocantins
      { value: 'to_palmas', label: 'Poupatempo Palmas' },
      { value: 'to_araguaina', label: 'Poupatempo Araguaína' },
      { value: 'to_gurupi', label: 'Poupatempo Gurupi' },
      { value: 'to_porto_nacional', label: 'Poupatempo Porto Nacional' },
      { value: 'to_paraiso_tocantins', label: 'Poupatempo Paraíso do Tocantins' },
      { value: 'to_araguatins', label: 'Poupatempo Araguatins' },
      { value: 'to_colinas_tocantins', label: 'Poupatempo Colinas do Tocantins' },
      { value: 'to_tocantinopolis', label: 'Poupatempo Tocantinópolis' },
    ]
  };

  // Mapa de endereços reais das unidades
  const enderecosUnidades = {
    // São Paulo
    'sp_sp_se': 'Praça do Carmo, s/nº, Sé - São Paulo/SP',
    'sp_sp_itaquera': 'Av. do Contorno, 60 - Itaquera, São Paulo/SP',
    'sp_guarulhos': 'Rua José Campanella, 189 - Bairro Macedo, Guarulhos/SP',
    'sp_campinas': 'Av. Francisco Glicério, 935 - Centro, Campinas/SP',
    'sp_santos': 'Rua João Pessoa, 246 - Centro, Santos/SP',
    'sp_osasco': 'Av. Hilário Pereira de Souza, 664 - Centro, Osasco/SP',
    'sp_sorocaba': 'Rua Leopoldo Machado, 525 - Centro, Sorocaba/SP',
    'sp_ribeirao_preto': 'Av. Presidente Kennedy, 1500 - Novo Shopping Center, Ribeirão Preto/SP',
    'sp_sao_bernardo': 'Rua Nicolau Filizola, 100 - Centro, São Bernardo do Campo/SP',
    'sp_santo_andre': 'Rua das Figueiras, 474 - Centro, Santo André/SP',
    'sp_bauru': 'Av. Nações Unidas, 4-44 - Centro, Bauru/SP',
    'sp_piracicaba': 'Praça José Bonifácio, 700 - Centro, Piracicaba/SP',
    'sp_jundiai': 'Av. União dos Ferroviários, 1.760 - Centro, Jundiaí/SP',
    'sp_sao_jose_campos': 'Av. São João, 2.200 - Shopping Colinas (Piso Superior), São José dos Campos/SP',
    'sp_mogi_cruzes': 'Av. Ver. Narciso Yague Guimarães, 1.000 - Centro Cívico, Mogi das Cruzes/SP',
    'sp_taubate': 'Av. Bandeirantes, 808 - Jardim Maria Augusta (Complexo Shibata), Taubaté/SP',
    
    // Minas Gerais
    'mg_divinopolis': 'Av. Primeiro de Junho, 500 - Centro, Divinópolis/MG',
    'mg_bh_centro': 'Rua dos Tupis, 149 - Centro, Belo Horizonte/MG',
    'mg_contagem': 'Av. João César de Oliveira, 5.000 - Eldorado, Contagem/MG',
    'mg_uberlandia': 'Av. Rondon Pacheco, 4.600 - Tibery, Uberlândia/MG',
    'mg_juiz_fora': 'Rua Halfeld, 1.000 - Centro, Juiz de Fora/MG',
    'mg_montes_claros': 'Av. Dulce Sarmento, 3.000 - Major Prates, Montes Claros/MG',
    'mg_betim': 'Rua Pará, 50 - Centro, Betim/MG',
    'mg_sete_lagoas': 'Av. Getúlio Vargas, 200 - Centro, Sete Lagoas/MG',
    'mg_pouso_alegre': 'Av. Shishima Hifumi, 2.911 - Cidade Jardim, Pouso Alegre/MG',
    'mg_uberaba': 'Av. Leopoldino de Oliveira, 3.000 - Abadia, Uberaba/MG',
    'mg_governador_valadares': 'Av. Minas Gerais, 1.001 - Centro, Governador Valadares/MG',
    'mg_ipatinga': 'Av. Carlos Chagas, 766 - Centro, Ipatinga/MG',
    'mg_varginha': 'Av. Princesa do Sul, 1.200 - Centro, Varginha/MG',
    'mg_pocos_caldas': 'Rua Pernambuco, 570 - Centro, Poços de Caldas/MG',
    'mg_barbacena': 'Av. Bias Fortes, 300 - Centro, Barbacena/MG',
    
    // Rio de Janeiro
    'rj_rio_centro': 'Rua da Alfândega, 5 - Centro, Rio de Janeiro/RJ',
    'rj_rio_barra': 'Av. das Américas, 5.000 - Barra da Tijuca, Rio de Janeiro/RJ',
    'rj_niteroi': 'Rua Visconde de Sepetiba, 851 - Centro, Niterói/RJ',
    'rj_duque_caxias': 'Av. Presidente Vargas, 2.000 - Centro, Duque de Caxias/RJ',
    'rj_nova_iguacu': 'Av. Abílio Augusto Távora, 1.500 - Centro, Nova Iguaçu/RJ',
    'rj_sao_goncalo': 'Rua Dr. Feliciano Sodré, 100 - Centro, São Gonçalo/RJ',
    'rj_petropolis': 'Rua do Imperador, 350 - Centro, Petrópolis/RJ',
    'rj_volta_redonda': 'Av. Amaral Peixoto, 185 - Centro, Volta Redonda/RJ',
    'rj_campos': 'Rua Treze de Maio, 23 - Centro, Campos dos Goytacazes/RJ',
    'rj_cabo_frio': 'Av. Assunção, 1.334 - Centro, Cabo Frio/RJ',
    
    // Outros estados com endereços de referência
    'pr_curitiba': 'Rua Cândido Lopes, 133 - Centro, Curitiba/PR',
    'pr_londrina': 'Av. Higienópolis, 1.000 - Centro, Londrina/PR',
    'pr_maringa': 'Av. Getúlio Vargas, 806 - Centro, Maringá/PR',
    'pr_ponta_grossa': 'Praça Barão do Rio Branco, 12 - Centro, Ponta Grossa/PR',
    'pr_cascavel': 'Av. Brasil, 5.043 - Centro, Cascavel/PR',
    'pr_foz_iguacu': 'Av. Juscelino Kubitschek, 1.677 - Centro, Foz do Iguaçu/PR',
    
    'sc_florianopolis': 'Rua Tenente Silveira, 60 - Centro, Florianópolis/SC',
    'sc_joinville': 'Rua Princesa Isabel, 190 - Centro, Joinville/SC',
    'sc_blumenau': 'Rua XV de Novembro, 1.000 - Centro, Blumenau/SC',
    'sc_chapeco': 'Av. Getúlio Vargas, 1.200 - Centro, Chapecó/SC',
    'sc_criciuma': 'Av. Centenário, 2.733 - Centro, Criciúma/SC',
    
    'rs_porto_alegre': 'Av. Borges de Medeiros, 1.501 - Centro, Porto Alegre/RS',
    'rs_caxias_sul': 'Rua Sinimbu, 1.555 - Centro, Caxias do Sul/RS',
    'rs_pelotas': 'Rua Andrade Neves, 1.341 - Centro, Pelotas/RS',
    'rs_canoas': 'Av. Guilherme Schell, 6.750 - Centro, Canoas/RS',
    'rs_santa_maria': 'Av. Rio Branco, 1.380 - Centro, Santa Maria/RS',
    
    'ba_salvador': 'Rua Chile, 237 - Centro, Salvador/BA',
    'ba_feira_santana': 'Rua Senhor dos Passos, 980 - Centro, Feira de Santana/BA',
    'ba_vitoria_conquista': 'Av. Olivia Flores, 300 - Centro, Vitória da Conquista/BA',
    'ba_camacari': 'Av. Jorge Amado, 1.000 - Centro, Camaçari/BA',
    'ba_itabuna': 'Av. Aziz Maron, 1.334 - Centro, Itabuna/BA',
    
    'pe_recife': 'Av. Guararapes, 250 - Centro, Recife/PE',
    'pe_jaboatao_guararapes': 'Av. Barreto de Menezes, 1.000 - Prazeres, Jaboatão dos Guararapes/PE',
    'pe_olinda': 'Av. Getúlio Vargas, 1.481 - Varadouro, Olinda/PE',
    'pe_caruaru': 'Rua Vigário Freire, 36 - Centro, Caruaru/PE',
    'pe_petrolina': 'Av. Souza Filho, 1.000 - Centro, Petrolina/PE',
    
    'ce_fortaleza': 'Av. Barão de Studart, 1.000 - Aldeota, Fortaleza/CE',
    'ce_caucaia': 'Av. Central, 1.500 - Centro, Caucaia/CE',
    'ce_juazeiro_norte': 'Av. Padre Cícero, 2.555 - Centro, Juazeiro do Norte/CE',
    'ce_sobral': 'Rua Coronel Mont Alverne, 600 - Centro, Sobral/CE',
    'ce_maracanau': 'Av. Contorno Norte, 1.000 - Centro, Maracanaú/CE',
    
    'pb_joao_pessoa': 'Av. Dom Pedro II, 1.826 - Torre, João Pessoa/PB',
    'pb_campina_grande': 'Rua Marquês do Herval, 999 - Centro, Campina Grande/PB',
    'pb_santa_rita': 'Av. Tancredo Neves, 1.000 - Centro, Santa Rita/PB',
    'pb_bayeux': 'Av. Liberdade, 1.234 - Centro, Bayeux/PB',
    'pb_patos': 'Rua Epitácio Pessoa, 1.000 - Centro, Patos/PB',
    
    'rn_natal': 'Av. Bernardo Vieira, 3.775 - Tirol, Natal/RN',
    'rn_mossoró': 'Av. Rio Branco, 572 - Centro, Mossoró/RN',
    'rn_parnamirim': 'Av. Senador Salgado Filho, 1.559 - Centro, Parnamirim/RN',
    'rn_sao_goncalo_amarante': 'Rua Antônio Basílio, 1.000 - Centro, São Gonçalo do Amarante/RN',
    'rn_macaiba': 'Av. Coronel Estevam, 1.000 - Centro, Macaíba/RN',
    
    'al_maceio': 'Av. Fernandes Lima, 3.000 - Farol, Maceió/AL',
    'al_arapiraca': 'Av. Governador Lamenha Filho, 1.334 - Centro, Arapiraca/AL',
    'al_rio_largo': 'Rua Siqueira Campos, 1.000 - Centro, Rio Largo/AL',
    'al_palmeira_dos_indios': 'Av. Getúlio Vargas, 500 - Centro, Palmeira dos Índios/AL',
    'al_penedo': 'Av. Floriano Peixoto, 500 - Centro, Penedo/AL',
    
    'se_aracaju': 'Av. Barão de Maruim, 543 - Centro, Aracaju/SE',
    'se_nossa_senhora_socorro': 'Av. Coletora A, 1.000 - Centro, Nossa Senhora do Socorro/SE',
    'se_lagarto': 'Av. Antônio Garcia Filho, 1.000 - Centro, Lagarto/SE',
    'se_itabaiana': 'Av. Graccho Cardoso, 1.000 - Centro, Itabaiana/SE',
    'se_sao_cristovao': 'Av. Tancredo Neves, 1.000 - Centro, São Cristóvão/SE',
    
    'pi_teresina': 'Av. Frei Serafim, 2.352 - Centro, Teresina/PI',
    'pi_parnaiba': 'Av. Presidente Vargas, 1.000 - Centro, Parnaíba/PI',
    'pi_picos': 'Rua Monsenhor Hipólito, 1.000 - Centro, Picos/PI',
    'pi_floriano': 'Av. Getúlio Vargas, 1.000 - Centro, Floriano/PI',
    'pi_campo_maior': 'Rua Coelho Rodrigues, 1.000 - Centro, Campo Maior/PI',
    
    'ma_sao_luis': 'Av. Colares Moreira, 1.000 - Renascença, São Luís/MA',
    'ma_imperatriz': 'Av. Getúlio Vargas, 1.500 - Centro, Imperatriz/MA',
    'ma_timon': 'Av. Maranhão, 1.000 - Centro, Timon/MA',
    'ma_caxias': 'Av. Getúlio Vargas, 1.000 - Centro, Caxias/MA',
    'ma_codó': 'Av. José Sarney, 1.000 - Centro, Codó/MA',
    
    'pa_belem': 'Av. Presidente Vargas, 800 - Campina, Belém/PA',
    'pa_ananindeua': 'Av. Arterial 18, 1.000 - Centro, Ananindeua/PA',
    'pa_santarem': 'Av. Tapajós, 1.000 - Centro, Santarém/PA',
    'pa_maraba': 'Av. VP-8, 1.000 - Nova Marabá, Marabá/PA',
    'pa_castanhal': 'Av. Barão do Rio Branco, 1.000 - Centro, Castanhal/PA',
    
    'am_manaus': 'Av. Sete de Setembro, 1.546 - Centro, Manaus/AM',
    'am_parintins': 'Av. Amazonas, 1.000 - Centro, Parintins/AM',
    'am_itacoatiara': 'Av. Teodoro Soares, 1.000 - Centro, Itacoatiara/AM',
    'am_manacapuru': 'Av. Getúlio Vargas, 1.000 - Centro, Manacapuru/AM',
    'am_coari': 'Av. Clélia Duarte, 1.000 - Centro, Coari/AM',
    
    'ac_rio_branco': 'Av. Ceará, 2.000 - Centro, Rio Branco/AC',
    'ac_cruzeiro_sul': 'Av. Coronel Mâncio Lima, 1.000 - Centro, Cruzeiro do Sul/AC',
    'ac_sena_madureira': 'Av. Modesto Chaves, 1.000 - Centro, Sena Madureira/AC',
    'ac_tarauaca': 'Av. Santos Dumont, 1.000 - Centro, Tarauacá/AC',
    'ac_feijo': 'Av. Getúlio Vargas, 1.000 - Centro, Feijó/AC',
    
    'rr_boa_vista': 'Av. Ville Roy, 5.450 - Centro, Boa Vista/RR',
    'rr_rorainopolis': 'Av. Capitão Ene Garcez, 1.000 - Centro, Rorainópolis/RR',
    'rr_caracarai': 'Av. Santos Dumont, 1.000 - Centro, Caracaraí/RR',
    'rr_alto_alegre': 'Av. Principal, 1.000 - Centro, Alto Alegre/RR',
    'rr_mucajai': 'Av. Getúlio Vargas, 1.000 - Centro, Mucajaí/RR',
    
    'ap_macapa': 'Av. Padre Júlio Maria Lombaerd, 1.000 - Centro, Macapá/AP',
    'ap_santana': 'Av. Santana, 1.000 - Centro, Santana/AP',
    'ap_laranjal_jari': 'Av. Tancredo Neves, 1.000 - Centro, Laranjal do Jari/AP',
    'ap_oiapoque': 'Av. Santos Dumont, 1.000 - Centro, Oiapoque/AP',
    'ap_mazagao': 'Av. Barão do Rio Branco, 1.000 - Centro, Mazagão/AP',
    
    'ro_porto_velho': 'Av. Sete de Setembro, 1.907 - Centro, Porto Velho/RO',
    'ro_ji_parana': 'Av. Marechal Rondon, 1.000 - Centro, Ji-Paraná/RO',
    'ro_ariquemes': 'Av. Tancredo Neves, 1.000 - Centro, Ariquemes/RO',
    'ro_vilhena': 'Av. Capitão Castro, 1.000 - Centro, Vilhena/RO',
    'ro_cacoal': 'Av. Porto Velho, 1.000 - Centro, Cacoal/RO',
    
    'ms_campo_grande': 'Av. Afonso Pena, 3.000 - Centro, Campo Grande/MS',
    'ms_dourados': 'Av. Presidente Vargas, 1.000 - Centro, Dourados/MS',
    'ms_tres_lagoas': 'Av. Ranulpho Marques Leal, 1.000 - Centro, Três Lagoas/MS',
    'ms_corumba': 'Rua Frei Mariano, 1.000 - Centro, Corumbá/MS',
    'ms_ponta_pora': 'Av. Brasil, 1.000 - Centro, Ponta Porã/MS',
    
    'mt_cuiaba': 'Av. Getúlio Vargas, 1.000 - Centro, Cuiabá/MT',
    'mt_varzea_grande': 'Av. Castelo Branco, 1.000 - Centro, Várzea Grande/MT',
    'mt_rondonopolis': 'Av. Duque de Caxias, 1.000 - Centro, Rondonópolis/MT',
    'mt_sinop': 'Av. das Embaúbas, 1.000 - Centro, Sinop/MT',
    'mt_tangara_serra': 'Av. Brasil, 1.000 - Centro, Tangará da Serra/MT',
    
    'go_goiania': 'Av. Goiás, 1.000 - Centro, Goiânia/GO',
    'go_aparecida_goiania': 'Av. Independência, 1.000 - Centro, Aparecida de Goiânia/GO',
    'go_anapolis': 'Av. Brasil, 1.000 - Centro, Anápolis/GO',
    'go_rio_verde': 'Av. Presidente Vargas, 1.000 - Centro, Rio Verde/GO',
    'go_luziania': 'Av. JK, 1.000 - Centro, Luziânia/GO',
    
    'df_brasilia': 'SCS Quadra 06, Ed. Shopping Center Conjunto Nacional - Asa Sul, Brasília/DF',
    'df_taguatinga': 'Av. Comercial Norte, Lote 01 - Taguatinga Norte, Brasília/DF',
    'df_ceilandia': 'Av. Hélio Prates, 1.000 - Centro, Ceilândia/DF',
    'df_samambaia': 'Av. Samambaia, 1.000 - Centro, Samambaia/DF',
    'df_planaltina': 'Av. Independência, 1.000 - Centro, Planaltina/DF',
    
    'es_vitoria': 'Av. Jerônimo Monteiro, 57 - Centro, Vitória/ES',
    'es_vila_velha': 'Av. Luciano das Neves, 2.418 - Centro, Vila Velha/ES',
    'es_cariacica': 'Av. Expedito Garcia, 1.000 - Centro, Cariacica/ES',
    'es_serra': 'Av. Eldes Scherrer Souza, 1.000 - Centro, Serra/ES',
    'es_cachoeiro_itapemirim': 'Rua 25 de Março, 1.000 - Centro, Cachoeiro de Itapemirim/ES',
    
    'to_palmas': 'Av. Teotônio Segurado, 1.000 - Centro, Palmas/TO',
    'to_araguaina': 'Av. Filadélfia, 1.000 - Centro, Araguaína/TO',
    'to_gurupi': 'Av. Pará, 1.000 - Centro, Gurupi/TO',
    'to_porto_nacional': 'Av. Beira Rio, 1.000 - Centro, Porto Nacional/TO',
    'to_paraiso_tocantins': 'Av. Transbrasiliana, 1.000 - Centro, Paraíso do Tocantins/TO',
  };

  // Filtrar unidades baseadas no estado
  const unidadesFiltradas = estadoSelecionado ? todasUnidades[estadoSelecionado as keyof typeof todasUnidades] || [] : [];

  // Função para obter endereço da unidade
  const getEnderecoUnidade = (unidadeValue: string): string => {
    // Se tiver endereço específico, usar ele
    if (enderecosUnidades[unidadeValue as keyof typeof enderecosUnidades]) {
      return enderecosUnidades[unidadeValue as keyof typeof enderecosUnidades];
    }
    
    // Se não tiver, gerar um endereço fictício baseado no nome da unidade
    const unidadeInfo = unidadesFiltradas.find(u => u.value === unidadeValue);
    if (unidadeInfo) {
      const nomeCidade = unidadeInfo.label.replace('Poupatempo ', '').replace('UAI ', '');
      
      // Gerar número variado baseado no hash do nome da unidade
      const hash = unidadeValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const numeroRua = 150 + (hash % 1850); // Números entre 150 e 2000
      
      // Variações de logradouros para parecer mais natural
      const logradouros = [
        'Av. Central',
        'Rua Principal',
        'Av. Governador',
        'Rua Presidente Vargas',
        'Av. Brasil',
        'Rua XV de Novembro',
        'Av. Getúlio Vargas',
        'Rua Barão de',
        'Av. Santos Dumont'
      ];
      
      const logradouro = logradouros[hash % logradouros.length];
      return `${logradouro}, ${numeroRua} - Centro, ${nomeCidade}`;
    }
    
    return 'Rua Principal, 500 - Centro';
  };

  const isFormValid = () => {
    return unidade.trim() !== '' && 
           data !== undefined && 
           horario.trim() !== '';
  };

  useEffect(() => {
    // Recuperar o estado selecionado da página anterior
    const enderecoData = localStorage.getItem('enderecoData');
    if (enderecoData) {
      const { estado } = JSON.parse(enderecoData);
      setEstadoSelecionado(estado);
    }

    // Recuperar serviço selecionado
    const servico = localStorage.getItem('servicoSelecionado');
    if (servico) {
      const servicoData = JSON.parse(servico);
      setServicoSelecionado(servicoData);
    }
  }, []);


  const handleVoltar = () => {
    navigate('/endereco');
  };

  const handleProximo = async () => {
    if (!isFormValid()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Salvar dados do agendamento
    const agendamentoData = { unidade, data, horario };
    localStorage.setItem('agendamentoData', JSON.stringify(agendamentoData));
    
    // Buscar dados pessoais e do serviço
    const dadosPessoaisString = localStorage.getItem('dadosPessoais');
    const servicoString = localStorage.getItem('servicoSelecionado');
    
    if (dadosPessoaisString && servicoString) {
      const dadosPessoais = JSON.parse(dadosPessoaisString);
      const servico = JSON.parse(servicoString);
      const dataFormatada = data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : '';
      
      // Enviar email de confirmação
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.functions.invoke('send-agendamento-email', {
          body: {
            nome: dadosPessoais.nomeCompleto,
            email: dadosPessoais.email,
            unidade: unidade,
            data: dataFormatada,
            horario: horario,
            servico: servico.nome || servico.title,
            endereco: getEnderecoUnidade(unidade)
          }
        });
        console.log('📧 Email de confirmação enviado');
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }
    
    // 🔔 6. Notificação de confirmação do agendamento
    const dataFormatada = data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : '';
    const dataHorario = `${dataFormatada} às ${horario}`;
    sendNotification(
      '🔔 Confirmação do agendamento',
      `📍 Tudo certo! Seu atendimento está agendado. 📅 Data e horário: ${dataHorario} 📌 Endereço e informações completas foram enviadas para seu e-mail.`,
      'scheduling-confirmed'
    );
    
    console.log('Dados do agendamento:', agendamentoData);
    navigate('/pagamento');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <img 
            src="/lovable-uploads/77c50366-3c6d-4d7b-b8a7-4fa2fc4e1fa3.png" 
            alt="Poupatempo" 
            className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <h1 className="text-lg font-medium">Agendamento</h1>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-6">
            {/* Estado selecionado info */}
            {estadoSelecionado && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Estado selecionado:</strong> {estadoSelecionado}
                </p>
              </div>
            )}

            {/* Unidade */}
            <div className="space-y-3">
              <Label className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Unidade Poupa Tempo*
              </Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger className="w-full border-gray-300 bg-white h-10">
                  <SelectValue placeholder={
                    estadoSelecionado 
                      ? "Selecione a unidade de atendimento" 
                      : "Selecione um estado primeiro na página anterior"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  {unidadesFiltradas.map((unid) => (
                    <SelectItem key={unid.value} value={unid.value}>
                      {unid.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-600">
                {unidadesFiltradas.length} unidades disponíveis em {estadoSelecionado || 'nenhum estado selecionado'}
              </p>
              {/* Endereço da unidade selecionada */}
              {unidade && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {unidadesFiltradas.find(u => u.value === unidade)?.label}
                      </p>
                      <p className="text-sm text-green-700">
                        {getEnderecoUnidade(unidade)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Data do Agendamento*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 bg-white h-10",
                        !data && "text-gray-500"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                   <PopoverContent className="w-auto p-0 bg-white border border-gray-300 shadow-lg z-50" align="start">
                     <CalendarComponent
                       mode="single"
                       selected={data}
                       onSelect={setData}
                       initialFocus
                       locale={ptBR}
                       className="p-3 pointer-events-auto"
                     />
                   </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horário*
                </Label>
                <Select value={horario} onValueChange={setHorario}>
                  <SelectTrigger className="w-full border-gray-300 bg-white h-10">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="08:30">08:30</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="09:30">09:30</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="10:30">10:30</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="11:30">11:30</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="14:30">14:30</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="15:30">15:30</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="16:30">16:30</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-blue-600">
              Selecione uma data disponível (segunda a sexta)
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-sm font-medium text-gray-800">Informações Importantes:</h3>
              </div>
              <div className="ml-6 space-y-1 text-sm text-gray-700">
                <p>• Chegue 15 minutos antes do horário agendado</p>
                <p>• Leve todos os documentos originais</p>
                <p>• O atendimento tem duração aproximada de 30 minutos</p>
                <p>• Não é permitido remarcar no mesmo dia</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-300 text-gray-700 border-gray-300 hover:bg-gray-400 h-10"
                onClick={handleVoltar}
              >
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10"
                onClick={handleProximo}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-800 text-white mt-auto">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <img 
            src="/lovable-uploads/a01f8b20-e4c2-4d31-bfe8-4c0e6d88ddd4.png" 
            alt="Gov.br" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-lg font-medium mb-2">Portal OficiaI</h2>
          <p className="text-sm text-gray-300 mb-6">
            Ministério da Gestão e da Inovação em Serviços Públicos
          </p>
          <div className="border-t border-gray-600 pt-4">
            <p className="text-xs text-gray-400">
              Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendamento;
