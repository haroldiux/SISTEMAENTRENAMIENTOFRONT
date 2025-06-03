describe("Dashboard Role-based Tests", () => {
  beforeEach(() => {
    cy.visit("/login");
    // Login como docente
    cy.get('input[aria-label="CI o Código de estudiante"]').type("9876543");
    cy.get('input[aria-label="Contraseña"]').type("admin1234");
    cy.get("button").contains("INGRESAR").click();

    // Esperar a que redirija al dashboard
    cy.url().should("include", "/");
  });

  it("should display docente dashboard and allow navigation", () => {
    // Check dashboard title
    cy.contains("Dashboard").should("be.visible");

    // Check presence of key sections
    cy.contains("Casos Clínicos Activos").should("be.visible");
    cy.contains("Evaluaciones Pendientes").should("be.visible");
    cy.contains("Promedio de Notas").should("be.visible");

    // Interact with a clinical case
    cy.get("q-item")
      .contains("Casos Clínicos Activos")
      .parent()
      .within(() => {
        cy.get("q-item").first().click();
      });

    // Verify navigation to case detail page
    cy.url().should("include", "/docente-caso-detalle");

    // Go back to dashboard
    cy.go("back");

    // Interact with evaluation pending
    cy.get("q-item")
      .contains("Evaluaciones Pendientes de Calificación")
      .parent()
      .within(() => {
        cy.get("q-item")
          .first()
          .within(() => {
            cy.contains("Calificar").click();
          });
      });

    // Verify navigation to evaluation page
    cy.url().should("include", "/docente-evaluacion-calificar");

    // Test buttons for creating new case and evaluation
    cy.visit("/");
    cy.contains("Crear Nuevo Caso Clínico").click();
    cy.url().should("include", "/docente-crear-caso");

    cy.visit("/");
    cy.contains("Crear Nueva Evaluación").click();
    cy.url().should("include", "/docente-crear-evaluacion");
  });
});
