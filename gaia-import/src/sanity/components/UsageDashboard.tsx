import React, { useEffect, useState } from 'react'
import { Card, Text, Stack, Box, Heading, Badge, Container, Grid } from '@sanity/ui'
import { useClient } from 'sanity'

export function UsageDashboard() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState({ props: 0, docs: 0, images: 0, isLoading: true })

  useEffect(() => {
    async function fetchStats() {
      try {
        const docQuery = `count(*[!(_id in path("_.**")) && !(_type in ["sanity.imageAsset", "sanity.fileAsset"])])`;
        
        const dataSite = await client.fetch(`{
          "props": count(*[_type == "property"]),
          "docs": ${docQuery},
          "images": count(*[_type == "sanity.imageAsset"])
        }`)

        setStats({ 
          props: dataSite.props, 
          docs: dataSite.docs, 
          images: dataSite.images,
          isLoading: false 
        })
      } catch (err) {
        console.error("Erro ao puxar stats", err)
      }
    }
    const intervalId = setInterval(fetchStats, 10000) // atualiza a cada 10seg
    fetchStats()
    return () => clearInterval(intervalId)
  }, [client])

  const maxLimit = 10000; // plano Free do Sanity
  const isDanger = stats.docs > 9000;

  return (
    <Container width={3} padding={4}>
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={4}>
          <Heading as="h2" size={4}>📊 Monitor de Saúde e Uso</Heading>
          <Text muted>Esta aba analisa a quantidade de dados reais utilizados na sua cota do plano (10.000 documentos no Free).</Text>

          <Box marginY={4}>
            <Grid columns={[1, 1, 3]} gap={4}>
              <Card padding={4} border radius={3} tone="primary">
                <Stack space={3}>
                  <Text size={1} weight="semibold">IMÓVEIS REGISTRADOS (SITE)</Text>
                  <Text size={5} weight="bold">{stats.isLoading ? '...' : stats.props}</Text>
                  <Text size={1} muted>Total de imóveis ativos no site oficial.</Text>
                </Stack>
              </Card>

              <Card padding={4} border radius={3} tone={isDanger ? 'critical' : 'positive'}>
                <Stack space={3}>
                  <Text size={1} weight="semibold">COTA GLOBAL DO SANITY (MAX: 10.000)</Text>
                  <Text size={5} weight="bold">{stats.isLoading ? '...' : stats.docs}</Text>
                  <Badge tone={isDanger ? 'critical' : 'positive'} padding={2} radius={2}>
                    {stats.isLoading ? '...' : `${((stats.docs / maxLimit) * 100).toFixed(1)}% do limite utilizado`}
                  </Badge>
                </Stack>
              </Card>

              <Card padding={4} border radius={3} tone="caution">
                <Stack space={3}>
                  <Text size={1} weight="semibold">ASSETS E IMAGENS (SITE)</Text>
                  <Text size={5} weight="bold">{stats.isLoading ? '...' : stats.images}</Text>
                  <Text size={1} muted>Total de imagens no projeto.</Text>
                </Stack>
              </Card>
            </Grid>
          </Box>
        </Stack>
      </Card>
    </Container>
  )
}
